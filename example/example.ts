import { Rule, Validate } from "../src/main.ts";

// Basic validation example
const validation = new Validate({
  name: Rule.string("Josh"),
  age: Rule.number(17, { min: 0, max: 100 }),
  isAdmin: Rule.boolean(true),
  hobbies: Rule.array(["reading", "coding"], { minLength: 1, maxLength: 5 }),
  email: Rule.email("josh@example.com"),
  address: Rule.object({ street: "123 Main St", city: "Anytown", state: "CA", zip: "12345" }),
  birthdate: Rule.date("1990-01-01"),
  password: Rule.password("P@ssw0rd", { minLength: 8, maxLength: 100 }),
  regex: Rule.regex("123-45-678", /^\d{3}-\d{2}-\d{3}$/),
  dateBetween: Rule.dateBetween("2020-01-01", { start: "2019-01-01", end: "2021-01-01" }),
  file: Rule.file(new File(["file content"], "example.txt")),
  url: Rule.url("https://example.com"),
  mime: Rule.mime(new File(["file content"], "example.txt"), ["text/plain"]),
  arrayIncludes: Rule.arrayIncludes(["reading", "coding", "gaming"], ["reading", "coding"]),
  arrayOf: Rule.arrayOf(["reading", "coding", "gaming"], Rule.string),
  hasProperties: Rule.hasProperties({ street: "123 Main St", city: "Anytown", state: "CA", zip: "12345" }, ["street", "city", "state", "zip"]),
  shape: Rule.shape({ street: "123 Main St", city: "Anytown", state: "CA", zip: "12345" }, {
    street: Rule.string,
    city: Rule.string,
    state: Rule.string,
    zip: Rule.string,
  }),
});

// instanceOf validation example
class CustomDate extends Date {}
const dateInstance = new CustomDate();
const numberInstance = new Number(42);

const instanceValidation = new Validate({
  // Must be instance of Date or CustomDate
  dateField: Rule.instanceOf(dateInstance, Date, CustomDate),
  
  // Must be instance of Number
  numberField: Rule.instanceOf(numberInstance, Number),
  
  // Will fail - string literal is not instance of Number
  invalidField: Rule.instanceOf("42", Number)
});

// UUIDv4 validation example
const uuidValidation = new Validate({
  // Valid UUIDv4
  validUuid: Rule.uuidv4("123e4567-e89b-4d3c-8456-426614174000"),
  
  // Invalid UUIDv4 (wrong version number)
  invalidUuidVersion: Rule.uuidv4("123e4567-e89b-5d3c-8456-426614174000"),
  
  // Invalid UUIDv4 (wrong format)
  invalidUuidFormat: Rule.uuidv4("not-a-uuid")
});

console.log({ validation });
console.log({ instanceValidation });
console.log({ uuidValidation });

// Form data validation example
function createFormData() {
  const form = new FormData();
  form.append('name', 'John Doe');
  form.append('age', '25');
  return form;
}

interface UserFormData {
  name: string;
  age: number;
}

const formData = createFormData();
const formValidation = new Validate({
  user: Rule.formData<UserFormData>(
    formData,
    {
      name: Rule.string,
      age: (value) => Rule.number(Number(value))
    }
  )
});

if (formValidation.result.valid) {
  const validatedData = formValidation.result.data.user;
  // validatedData is now typed as { name: string; age: number }
  console.log(validatedData.name);  // string
  console.log(validatedData.age);   // number
} else {
  console.log(formValidation.result.exception);
}

function createFormData2() {
  const form = new FormData();
  form.append('name', 'ayayay');
  form.append('age', '12');
  return form
}
const form_data = createFormData2()
const n = new Validate({
  name: Rule.string(form_data.get('name')),
  age: Rule.number(form_data.get('age')),
})
if(n.result.valid) {
  const data = n.result.data
  console.log(data)
} else {
  console.log(n.result.exception)
}

const form_validation = new Validate({
  form: Rule.shape(
    { name: "John", age: 25 },
    {
      name: Rule.string,
      age: Rule.number,
    }
  )
});

if (form_validation.result.valid) {
  const validated_data = form_validation.result.data.form;
  console.log(validated_data.name); 
  console.log(validated_data.age);  
} else {
  console.log(form_validation.result.exception);
}