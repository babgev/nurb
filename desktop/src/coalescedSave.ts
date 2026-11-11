/** Save at bounded intervals even when streaming never pauses; serialize writes. */
export function coalescedSave<T>(write: (value: T) => Promise<unknown>, failed: (error: unknown) => void, delay = 150) {
  let pending: { value: T } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let writes = Promise.resolve();
  const flush = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const next = pending;
    pending = undefined;
    if (next) writes = writes.then(() => write(next.value)).then(() => {}, failed);
    return writes;
  };
  return {
    update(value: T) {
      pending = { value };
      if (timer === undefined) timer = setTimeout(flush, delay);
    },
    flush,
  };
}
