/**
 * Checks if a given object behaves like a stream
 *
 * @param s object to check
 * @returns true if the object behaves like a stream
 */
const isStream = (s: any) =>
  s != null &&
  typeof s === "object" &&
  typeof s.pipe === "function";

/**
 * Given some object, it returns a JSON representation of it. It assumes that
 * there is a valid representation, no matter what the container format is. For
 * example, if you pass it a stream, it will consume the stream and attempt
 * to run `JSON.parse` on it.
 *
 * @param data object to convert to JSON
 */
export function fromAnyToJSON(data: any) {
  return new Promise((resolve, reject) => {
    if (isStream(data)) {
      const bufs: Buffer[] = [];
      data.on("data", (buf: Buffer) => bufs.push(buf));
      data.on("end", () => resolve(JSON.parse(Buffer.concat(bufs).toString())));
      data.on("error", reject);
      return;
    }
    if (typeof data === "string") {
      return resolve(JSON.parse(data));
    }
    if (Buffer.isBuffer(data)) {
      return resolve(JSON.parse(data.toString()));
    }
    if (typeof data === "object") {
      return resolve(data);
    }
    reject(new Error(`data was of unexpected type ${typeof data}`));
  });
}
