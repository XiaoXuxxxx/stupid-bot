
export default class Queue<T> {
  private items: T[] = [];
  private currentIndex = 0;

  public getCurrentIndex(): number {
    return this.currentIndex;
  };

  public getUpcomingItems(): T[] {
    return this.items.slice(this.currentIndex + 1);
  };

  public getCurrentItem(): T | null {
    return this.items[this.currentIndex] ?? null;
  };

  public getPreviousItems(): T[] {
    return this.items.slice(0, this.currentIndex);
  };

  public addItems(...items: T[]): void {
    this.items.push(...items);
  };

  public nextItem(): T | null {
    if (this.items.length === this.currentIndex + 1) {
      return null;
    }

    if (this.items.length === 0) {
      return null;
    }

    return this.items[++this.currentIndex];
  };

  public previousItem(): T | null {
    if (this.currentIndex === 0) {
      return null;
    }

    if (this.items.length === 0) {
      return null;
    }

    return this.items[--this.currentIndex];
  };

  public jumpToItem(itemPosition: number): T | null {
    const index = this.getCurrentIndex() + itemPosition;

    if (index < 0 || index >= this.items.length) {
      return null;
    }

    this.currentIndex = index;

    return this.getCurrentItem();
  };

  public pruneItems(tailCount = 0): void {
    if (tailCount > this.getPreviousItems().length) {
      tailCount = this.getPreviousItems().length;
    }

    this.items = this.items.slice(this.currentIndex - tailCount);
    this.currentIndex = tailCount;
  };

  public clearUpcomingItems(): void {
    this.items = this.items.slice(0, this.currentIndex + 1);
  };

  public clearAll(): void {
    this.items = [];
    this.currentIndex = 0;
  };
}
