const isStream = (s: any) =>
  s != null &&
  typeof s === "object" &&
  typeof s.pipe === "function";

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
