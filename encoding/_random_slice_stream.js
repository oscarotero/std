// Copyright 2018-2025 the Deno authors. MIT license.
// This module is browser compatible.
export class RandomSliceStream extends TransformStream {
  constructor() {
    super({
      transform(chunk, controller) {
        const i = Math.floor(Math.random() * chunk.length);
        controller.enqueue(chunk.slice(0, i));
        controller.enqueue(chunk.slice(i));
      },
    });
  }
}
