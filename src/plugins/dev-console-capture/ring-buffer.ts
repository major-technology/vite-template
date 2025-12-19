export class RingBuffer<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private count = 0

  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity)
  }

  push(item: T): void {
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.capacity

    if (this.count < this.capacity) {
      this.count++
    } else {
      this.head = (this.head + 1) % this.capacity
    }
  }

  last(n: number): T[] {
    const result: T[] = []
    const start = Math.max(0, this.count - n)

    for (let i = start; i < this.count; i++) {
      const index = (this.head + i) % this.capacity
      const item = this.buffer[index]
      if (item !== undefined) {
        result.push(item)
      }
    }

    return result
  }

  toArray(): T[] {
    return this.last(this.count)
  }

  clear(): void {
    this.buffer = new Array(this.capacity)
    this.head = 0
    this.tail = 0
    this.count = 0
  }

  get size(): number {
    return this.count
  }
}
