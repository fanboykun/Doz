// deno-lint-ignore-file no-explicit-any
type Prettify<T> = {
  [K in keyof T]: T[K]
// deno-lint-ignore ban-types
} & {};

type VALID_RULS_RESULT<T> = [true, T, undefined];
type INVALID_RULS_RESULT = [false, unknown, string];
type RULE_RESULT<T> = VALID_RULS_RESULT<T> | INVALID_RULS_RESULT;

type SUCESS_RESULT<T> = {
  valid: true,
  data: Prettify<{
    [K in keyof T]: T[K]
  }>
}
type FAILED_RESULT<T> = {
  valid: false,
  exception: Prettify<{
    [K in keyof T]: string[]
  }>,
}
type RESULT<T extends object> = SUCESS_RESULT<T> | FAILED_RESULT<T>

type Inputs<T> = {
  [K in keyof T]: RULE_RESULT<T[K]>
}

/**
 * Rules for validating inputs
 * 
 * @description
 * - Validate inputs
 * - Return validation result
 * 
 * @returns {RULE_RESULT}
 */
export class Rule {
  static string(i: any): RULE_RESULT<string> {
    if(typeof i !== "string") {
      return [false, i, "$ must be string"] as INVALID_RULS_RESULT;
    }
    if(i.trim().length === 0) {
      return [false, i, "$ cannot be empty"] as INVALID_RULS_RESULT;
    }
    return [true, i, undefined] as VALID_RULS_RESULT<string>;
  }

  static number(i: any, opt?: { min?: number, max?: number}): RULE_RESULT<number> {
    if(typeof i !== "number" || isNaN(i)) {
      return [false, i, "$ must be number"] as INVALID_RULS_RESULT;
    }
    if(opt) {
      if(opt.min && i < opt.min) {
        return [false, i, "$ must be greater than " + opt.min] as INVALID_RULS_RESULT;
      }
      if(opt.max && i > opt.max) {
        return [false, i, "$ must be less than " + opt.max] as INVALID_RULS_RESULT;
      }
    }
    return [true, i, undefined] as VALID_RULS_RESULT<number>;
  }

  static boolean(i: any): RULE_RESULT<boolean> {
    if(typeof i === "boolean") {
      return [true, i, undefined] as VALID_RULS_RESULT<boolean>;
    }
    return [false, i, "$ must be boolean"] as INVALID_RULS_RESULT;
  }

  static array(i: any, opt?: { minLength?: number, maxLength?: number }): RULE_RESULT<any[]> {
    if(!Array.isArray(i)) {
      return [false, i, "$ must be array"] as INVALID_RULS_RESULT;
    }
    if(opt) {
      if(opt.minLength !== undefined && i.length < opt.minLength) {
        return [false, i, `$ length must be at least ${opt.minLength}`] as INVALID_RULS_RESULT;
      }
      if(opt.maxLength !== undefined && i.length > opt.maxLength) {
        return [false, i, `$ length must be at most ${opt.maxLength}`] as INVALID_RULS_RESULT;
      }
    }
    return [true, i, undefined] as VALID_RULS_RESULT<any[]>;
  }

  static email(i: any): RULE_RESULT<string> {
    if(typeof i !== "string" || i.trim().length === 0) {
      return [false, i, "$ must be valid email address"] as INVALID_RULS_RESULT;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(i)) {
      return [false, i, "$ must be valid email address"] as INVALID_RULS_RESULT;
    }
    return [true, i, undefined] as VALID_RULS_RESULT<string>;
  }

  static object(i: any): RULE_RESULT<object> {
    if(typeof i !== "object" || i === null || Array.isArray(i)) {
      return [false, i, "$ must be object"] as INVALID_RULS_RESULT;
    }
    return [true, i, undefined] as VALID_RULS_RESULT<object>;
  }

  static date(i: any): RULE_RESULT<Date> {
    const date = new Date(i);
    if(isNaN(date.getTime())) {
      return [false, i, "$ must be valid date"] as INVALID_RULS_RESULT;
    }
    return [true, date, undefined] as VALID_RULS_RESULT<Date>;
  }

  static password(i: any, opt?: {
    minLength?: number,
    maxLength?: number,
    requireUppercase?: boolean,
    requireLowercase?: boolean,
    requireNumbers?: boolean,
    requireSpecialChars?: boolean
  }): RULE_RESULT<string> {
    if(typeof i !== "string") {
      return [false, i, "$ must be string"] as INVALID_RULS_RESULT;
    }

    const options = {
      minLength: 8,
      maxLength: 100,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      ...opt
    };

    if(i.length < options.minLength) {
      return [false, i, `$ must be at least ${options.minLength} characters`] as INVALID_RULS_RESULT;
    }
    if(i.length > options.maxLength) {
      return [false, i, `$ must be at most ${options.maxLength} characters`] as INVALID_RULS_RESULT;
    }
    if(options.requireUppercase && !/[A-Z]/.test(i)) {
      return [false, i, "$ must contain at least one uppercase letter"] as INVALID_RULS_RESULT;
    }
    if(options.requireLowercase && !/[a-z]/.test(i)) {
      return [false, i, "$ must contain at least one lowercase letter"] as INVALID_RULS_RESULT;
    }
    if(options.requireNumbers && !/\d/.test(i)) {
      return [false, i, "$ must contain at least one number"] as INVALID_RULS_RESULT;
    }
    if(options.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(i)) {
      return [false, i, "$ must contain at least one special character"] as INVALID_RULS_RESULT;
    }

    return [true, i, undefined] as VALID_RULS_RESULT<string>;
  }

  static regex(i: any, pattern: RegExp, errorMessage?: string): RULE_RESULT<string> {
    if(typeof i !== "string") {
      return [false, i, "$ must be string"] as INVALID_RULS_RESULT;
    }
    if(!pattern.test(i)) {
      return [false, i, errorMessage || "$ does not match required pattern"] as INVALID_RULS_RESULT;
    }
    return [true, i, undefined] as VALID_RULS_RESULT<string>;
  }

  static dateBetween(i: any, opt: { start: Date | string, end: Date | string }): RULE_RESULT<Date> {
    const dateResult = Rule.date(i);
    if(!dateResult[0]) {
      return dateResult;
    }

    const date = dateResult[1];
    const start = new Date(opt.start);
    const end = new Date(opt.end);

    if(isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [false, i, "Invalid start or end date provided"] as INVALID_RULS_RESULT;
    }

    if(date < start || date > end) {
      return [false, i, `$ must be between ${start.toISOString()} and ${end.toISOString()}`] as INVALID_RULS_RESULT;
    }

    return [true, date, undefined] as VALID_RULS_RESULT<Date>;
  }

  static file(i: any, opt?: {
    maxSizeInBytes?: number,
    allowedExtensions?: string[]
  }): RULE_RESULT<File> {
    if(!(i instanceof File)) {
      return [false, i, "$ must be a File"] as INVALID_RULS_RESULT;
    }

    if(opt?.maxSizeInBytes && i.size > opt.maxSizeInBytes) {
      const maxSizeMB = opt.maxSizeInBytes / (1024 * 1024);
      return [false, i, `$ size must be less than ${maxSizeMB}MB`] as INVALID_RULS_RESULT;
    }

    if(opt?.allowedExtensions) {
      const ext = i.name.split('.').pop()?.toLowerCase();
      if(!ext || !opt.allowedExtensions.includes(ext)) {
        return [false, i, `$ must have one of these extensions: ${opt.allowedExtensions.join(', ')}`] as INVALID_RULS_RESULT;
      }
    }

    return [true, i, undefined] as VALID_RULS_RESULT<File>;
  }

  static url(i: any, opt?: { protocols?: string[] }): RULE_RESULT<URL> {
    if(typeof i !== "string") {
      return [false, i, "$ must be string"] as INVALID_RULS_RESULT;
    }

    try {
      const url = new URL(i);
      if(opt?.protocols && !opt.protocols.includes(url.protocol.replace(':', ''))) {
        return [false, i, `$ must use one of these protocols: ${opt.protocols.join(', ')}`] as INVALID_RULS_RESULT;
      }
      return [true, url, undefined] as VALID_RULS_RESULT<URL>;
    } catch {
      return [false, i, "$ must be a valid URL"] as INVALID_RULS_RESULT;
    }
  }

  static mime(i: any, allowedMimeTypes: string[]): RULE_RESULT<File> {
    if(!(i instanceof File)) {
      return [false, i, "$ must be a File"] as INVALID_RULS_RESULT;
    }

    if(!allowedMimeTypes.includes(i.type)) {
      return [false, i, `$ must be one of these MIME types: ${allowedMimeTypes.join(', ')}`] as INVALID_RULS_RESULT;
    }

    return [true, i, undefined] as VALID_RULS_RESULT<File>;
  }

  static arrayIncludes<T>(i: any, items: T[]): RULE_RESULT<T[]> {
    if(!Array.isArray(i)) {
      return [false, i, "$ must be array"] as INVALID_RULS_RESULT;
    }

    const missingItems = items.filter(item => !i.includes(item));
    if(missingItems.length > 0) {
      return [false, i, `$ must include all of these items: ${missingItems.join(', ')}`] as INVALID_RULS_RESULT;
    }

    return [true, i, undefined] as VALID_RULS_RESULT<T[]>;
  }

  static arrayOf(i: any, validator: (item: any) => RULE_RESULT<unknown>): RULE_RESULT<any[]> {
    if(!Array.isArray(i)) {
      return [false, i, "$ must be array"] as INVALID_RULS_RESULT;
    }

    for(let index = 0; index < i.length; index++) {
      const result = validator(i[index]);
      if(!result[0]) {
        return [false, i, `Item at index ${index}: ${result[2]}`] as INVALID_RULS_RESULT;
      }
    }

    return [true, i, undefined] as VALID_RULS_RESULT<any[]>;
  }

  static hasProperties(i: any, properties: string[]): RULE_RESULT<object> {
    if(typeof i !== "object" || i === null) {
      return [false, i, "$ must be object"] as INVALID_RULS_RESULT;
    }

    const missingProps = properties.filter(prop => !(prop in i));
    if(missingProps.length > 0) {
      return [false, i, `$ must have all of these properties: ${missingProps.join(', ')}`] as INVALID_RULS_RESULT;
    }

    return [true, i, undefined] as VALID_RULS_RESULT<object>;
  }

  static shape<T extends Record<string, unknown>>(
    i: T,
    shape: { [K in keyof T]: (value: unknown) => RULE_RESULT<T[K]> }
  ): RULE_RESULT<T> {
    if(typeof i !== "object" || i === null) {
      return [false, i, "$ must be object"] as INVALID_RULS_RESULT;
    }

    const errors: string[] = [];
    const validatedData = {} as T;

    for(const [key, validator] of Object.entries(shape)) {
      if(!(key in i)) {
        errors.push(`Missing required property: ${key}`);
        continue;
      }
      const result = validator(i[key]);
      if(!result[0]) {
        errors.push(`${key}: ${result[2]}`);
      } else {
        validatedData[key as keyof T] = result[1] as T[keyof T];
      }
    }

    if(errors.length > 0) {
      return [false, i, errors.join('; ')] as INVALID_RULS_RESULT;
    }

    return [true, validatedData, undefined] as VALID_RULS_RESULT<T>;
  }

  static formData<T extends object>(
    formData: FormData,
    shape: { [K in keyof T]: (value: FormDataEntryValue | null) => RULE_RESULT<T[K]> }
  ): RULE_RESULT<T> {
    if(!(formData instanceof FormData)) {
      return [false, formData, "$ must be FormData"] as INVALID_RULS_RESULT;
    }

    const errors: string[] = [];
    const validatedData = {} as T;

    for(const [key, validator] of Object.entries(shape)) {
      const value = formData.get(key);
      /** @ts-ignore */
      const result = validator(value) as RULE_RESULT<T[keyof T]>;
      if(!result[0]) {
        // Replace $ with the actual field name in the error message
        const errorMessage = result[2].replace(/\$/g, key);
        errors.push(errorMessage);
      } else {
        validatedData[key as keyof T] = result[1] as T[keyof T];
      }
    }

    if(errors.length > 0) {
      return [false, formData, errors.join('; ')] as INVALID_RULS_RESULT;
    }

    return [true, validatedData, undefined] as VALID_RULS_RESULT<T>;
  }

  static nullable<T>(validator: (value: any) => RULE_RESULT<T>): (value: any) => RULE_RESULT<T | null> {
    return (value: any): RULE_RESULT<T | null> => {
      if (value === null) {
        return [true, null, undefined] as VALID_RULS_RESULT<null>;
      }
      return validator(value);
    };
  }

  static optional<T>(validator: (value: any) => RULE_RESULT<T>): (value: any) => RULE_RESULT<T | undefined> {
    return (value: any): RULE_RESULT<T | undefined> => {
      if (value === undefined) {
        return [true, undefined, undefined] as VALID_RULS_RESULT<undefined>;
      }
      return validator(value);
    };
  }

  static ip(i: any, allowLocal = true): RULE_RESULT<string> {
    if (typeof i !== "string") {
      return [false, i, "$ must be string"] as INVALID_RULS_RESULT;
    }

    // IPv4 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}:){1,7}:|^:([0-9a-fA-F]{1,4}:){1,6}|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;

    const isIPv4 = ipv4Regex.test(i);
    const isIPv6 = ipv6Regex.test(i);

    if (!isIPv4 && !isIPv6) {
      return [false, i, "$ must be valid IPv4 or IPv6 address"] as INVALID_RULS_RESULT;
    }

    if (!allowLocal) {
      // Check for local IPv4 addresses
      if (isIPv4) {
        const parts = i.split(".");
        if (
          parts[0] === "127" || // localhost
          parts[0] === "10" || // private network
          (parts[0] === "172" && parseInt(parts[1]) >= 16 && parseInt(parts[1]) <= 31) || // private network
          (parts[0] === "192" && parts[1] === "168") // private network
        ) {
          return [false, i, "$ must not be a local IP address"] as INVALID_RULS_RESULT;
        }
      }
      // Check for local IPv6 addresses
      if (isIPv6) {
        const lowercaseIP = i.toLowerCase();
        if (
          lowercaseIP === "::1" || // localhost
          lowercaseIP.startsWith("fc00:") || // unique local address
          lowercaseIP.startsWith("fd") || // unique local address
          lowercaseIP.startsWith("fe80:") // link-local address
        ) {
          return [false, i, "$ must not be a local IP address"] as INVALID_RULS_RESULT;
        }
      }
    }

    return [true, i, undefined] as VALID_RULS_RESULT<string>;
  }

  static instanceOf<T>(i: any, ...constructors: (new (...args: any[]) => T)[]): RULE_RESULT<T> {
    for (const constructor of constructors) {
      if (i instanceof constructor) {
        return [true, i, undefined] as VALID_RULS_RESULT<T>;
      }
    }
    const constructorNames = constructors.map(c => c.name).join(" or ");
    return [false, i, `$ must be instance of ${constructorNames}`] as INVALID_RULS_RESULT;
  }

  static uuidv4(i: any): RULE_RESULT<string> {
    if (typeof i !== "string") {
      return [false, i, "$ must be string"] as INVALID_RULS_RESULT;
    }

    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidv4Regex.test(i)) {
      return [false, i, "$ must be a valid UUIDv4"] as INVALID_RULS_RESULT;
    }

    return [true, i, undefined] as VALID_RULS_RESULT<string>;
  }
}

/**
 * Validation Executor
 * @description
 * - Execute validations
 * - Return validation result
 * @returns {Validate}
 */
export class Validate<T extends object> {
  public result = {} as SUCESS_RESULT<T> | FAILED_RESULT<T>;
  constructor(input: Inputs<T>) {
    let status: 'unresolved' | 'success' | 'failed' = 'unresolved'
    for(const [key, validation ] of Object.entries(input)) {
      const [valid, input, exception] = validation as RULE_RESULT<T[keyof T]>;
      if(status === 'unresolved') {
        status = valid ? 'success' : 'failed';
        this.result.valid = valid
      }
      if(this.result.valid) {
        this.result.data = {
          ...this.result.data,
          [key]: input
        }
      }
      else {
        this.result.exception = {
          ...this.result.exception,
          [key]: exception?.replaceAll("$", key)
        }
      }
      // console.log( { status } )
    }
  }
}
