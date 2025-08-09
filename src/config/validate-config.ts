import { Ajv, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import schema from './validation-schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true });
addFormats.default.default(ajv);

const validate = ajv.compile(schema);

export function validateConfig(config: unknown): void {
  const valid = validate(config);
  if (!valid) {
    const errors = formatAjvErrors(validate.errors);
    throw new Error(`Configuration validation error(s):\n • ${errors}`);
  }
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) return '';

  return errors
    .map((err) => {
      const propertyPath = err.instancePath ? err.instancePath.slice(1).replace(/\//g, '.') : 'root';

      if (err.keyword === 'required' && err.params && 'missingProperty' in err.params) {
        const missingProp = err.params.missingProperty;
        return `${propertyPath} is missing required property '${missingProp}'`;
      }

      return `${propertyPath} ${err.message}`;
    })
    .join('\n • ');
}
