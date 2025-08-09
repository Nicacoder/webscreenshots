export function deleteProperty(obj: any, parts: string[]): void {
  if (!obj) return;

  let [head, ...tail] = parts;

  const isArray = head.endsWith('[]');
  if (isArray) head = head.slice(0, -2);

  if (tail.length === 0) {
    if (isArray) {
      if (Array.isArray(obj[head])) {
        obj[head].forEach((item: any) => {
          if (item && item.hasOwnProperty(parts[parts.length - 1])) {
            delete item[parts[parts.length - 1]];
          }
        });
      }
    } else {
      if (Array.isArray(obj)) {
        obj.forEach((item: any) => {
          if (item && item.hasOwnProperty(head)) {
            delete item[head];
          }
        });
      } else if (obj.hasOwnProperty(head)) {
        delete obj[head];
      }
    }
  } else {
    if (isArray && Array.isArray(obj[head])) {
      obj[head].forEach((item: any) => {
        deleteProperty(item, tail);
      });
    } else if (obj.hasOwnProperty(head)) {
      deleteProperty(obj[head], tail);
    }
  }
}
