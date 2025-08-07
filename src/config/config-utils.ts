export function getString(env: NodeJS.ProcessEnv, key: string): string | undefined {
  return env[key] ?? undefined;
}

export function getNumber(env: NodeJS.ProcessEnv, key: string): number | undefined {
  const v = env[key];
  if (v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

export function getBoolean(env: NodeJS.ProcessEnv, key: string): boolean | undefined {
  const v = env[key];
  if (v === undefined) return undefined;
  return v.toLowerCase() === 'true';
}

export function getJson<T>(env: NodeJS.ProcessEnv, key: string): T | undefined {
  const v = env[key];
  if (v === undefined) return undefined;
  try {
    return JSON.parse(v) as T;
  } catch (err) {
    return undefined;
  }
}

export function cleanObject(obj: any): any | undefined {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    const cleanedArray = obj.map(cleanObject).filter((v) => v !== undefined);
    return cleanedArray.length === 0 ? undefined : cleanedArray;
  }

  const cleanedObj = Object.entries(obj).reduce((acc: any, [key, value]) => {
    if (value === undefined) return acc;

    const cleanedValue = cleanObject(value);
    if (cleanedValue === undefined) return acc;

    acc[key] = cleanedValue;
    return acc;
  }, {});

  if (Object.keys(cleanedObj).length === 0) {
    return undefined;
  }

  return cleanedObj;
}
