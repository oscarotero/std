// Copyright 2018-2025 the Deno authors. MIT license.
import { getNodeFs, getNodeStream, getNodeTty, getNodeUtil } from "./_utils.js";
import { mapError } from "./_map_error.js";
import { toFileInfo } from "./_to_file_info.js";
/**
 * The internal class to convert a Node file descriptor into a FsFile object.
 */
export class NodeFsFile {
  #nodeFs = getNodeFs();
  #nodeStream = getNodeStream();
  #nodeTty = getNodeTty();
  #nodeUtil = getNodeUtil();
  #nodeReadFd = this.#nodeUtil.promisify(this.#nodeFs.read);
  #nodeWriteFd = this.#nodeUtil.promisify(this.#nodeFs.write);
  #closed;
  #rid;
  #readableStream;
  #writableStream;
  constructor(fd) {
    this.#rid = fd;
    this.#closed = false;
  }
  get readable() {
    if (this.#readableStream == null) {
      const readStream = this.#nodeFs.createReadStream(null, {
        fd: this.#rid,
        autoClose: false,
      });
      this.#readableStream = this.#nodeStream.Readable.toWeb(readStream);
    }
    return this.#readableStream;
  }
  get writable() {
    if (this.#writableStream == null) {
      const writeStream = this.#nodeFs.createWriteStream(null, {
        fd: this.#rid,
        autoClose: false,
      });
      this.#writableStream = this.#nodeStream.Writable.toWeb(writeStream);
    }
    return this.#writableStream;
  }
  [Symbol.dispose]() {
    if (!this.#closed) {
      this.close();
    }
  }
  close() {
    this.#closed = true;
    this.#nodeFs.closeSync(this.#rid);
  }
  isTerminal() {
    return this.#nodeTty.isatty(this.#rid);
  }
  // deno-lint-ignore require-await no-unused-vars
  async lock(exclusive) {
    throw new Error("Method not implemented");
  }
  // deno-lint-ignore no-unused-vars
  lockSync(exclusive) {
    throw new Error("Method not implemented");
  }
  async read(p) {
    try {
      const { bytesRead } = await this.#nodeReadFd(
        this.#rid,
        p,
        0,
        p.length,
        null,
      );
      return bytesRead === 0 ? null : bytesRead;
    } catch (error) {
      throw mapError(error);
    }
  }
  readSync(p) {
    try {
      const bytesRead = this.#nodeFs.readSync(this.#rid, p);
      return bytesRead === 0 ? null : bytesRead;
    } catch (error) {
      throw mapError(error);
    }
  }
  //deno-lint-ignore no-unused-vars
  setRaw(mode, options) {
    throw new Error("Method not implemented");
  }
  async stat() {
    const nodeStatFd = this.#nodeUtil.promisify(this.#nodeFs.fstat);
    try {
      const fdStat = await nodeStatFd(this.#rid);
      return toFileInfo(fdStat);
    } catch (error) {
      throw mapError(error);
    }
  }
  statSync() {
    try {
      const fdStat = this.#nodeFs.fstatSync(this.#rid);
      return toFileInfo(fdStat);
    } catch (error) {
      throw mapError(error);
    }
  }
  async sync() {
    const nodeFsyncFd = this.#nodeUtil.promisify(this.#nodeFs.fsync);
    try {
      await nodeFsyncFd(this.#rid);
    } catch (error) {
      throw mapError(error);
    }
  }
  syncSync() {
    try {
      this.#nodeFs.fsyncSync(this.#rid);
    } catch (error) {
      throw mapError(error);
    }
  }
  async syncData() {
    const nodeFdatasyncFd = this.#nodeUtil.promisify(this.#nodeFs.fdatasync);
    try {
      await nodeFdatasyncFd(this.#rid);
    } catch (error) {
      throw mapError(error);
    }
  }
  syncDataSync() {
    try {
      this.#nodeFs.fdatasyncSync(this.#rid);
    } catch (error) {
      throw mapError(error);
    }
  }
  async truncate(len) {
    const nodeTruncateFd = this.#nodeUtil.promisify(this.#nodeFs.ftruncate);
    try {
      await nodeTruncateFd(this.#rid, len);
    } catch (error) {
      throw mapError(error);
    }
  }
  truncateSync(len) {
    try {
      this.#nodeFs.ftruncateSync(this.#rid, len);
    } catch (error) {
      throw mapError(error);
    }
  }
  // deno-lint-ignore require-await
  async unlock() {
    throw new Error("Method not implemented");
  }
  unlockSync() {
    throw new Error("Method not implemented");
  }
  async utime(atime, mtime) {
    const nodeUtimeFd = this.#nodeUtil.promisify(this.#nodeFs.futimes);
    try {
      await nodeUtimeFd(this.#rid, atime, mtime);
    } catch (error) {
      throw mapError(error);
    }
  }
  utimeSync(atime, mtime) {
    try {
      this.#nodeFs.futimesSync(this.#rid, atime, mtime);
    } catch (error) {
      throw mapError(error);
    }
  }
  async write(p) {
    try {
      const { bytesWritten } = await this.#nodeWriteFd(this.#rid, p);
      return bytesWritten;
    } catch (error) {
      throw mapError(error);
    }
  }
  writeSync(p) {
    try {
      return this.#nodeFs.writeSync(this.#rid, p);
    } catch (error) {
      throw mapError(error);
    }
  }
}
