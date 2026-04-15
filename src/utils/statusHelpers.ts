
export function statusStr(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'object') return (value.name ?? value.label ?? '').toLowerCase();
  return '';
}


export function statusName(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value.name ?? value.label ?? '';
  return '';
}
