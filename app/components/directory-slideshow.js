import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { registerDestructor } from '@ember/destroyable';

const CONTROLS_HIDE_DELAY_MS = 2000;
const SCROLL_SETTLE_MS = 80;

export default class DirectorySlideshowComponent extends Component {
  @tracked controlsVisible = true;
  viewportElement = null;
  scrollerElement = null;
  scrollSettleTimer = null;

  constructor(owner, args) {
    super(owner, args);

    registerDestructor(this, () => {
      if (this.scrollSettleTimer) {
        clearTimeout(this.scrollSettleTimer);
      }
    });
  }

  hideControlsAfterIdle = task({ restartable: true }, async () => {
    await timeout(CONTROLS_HIDE_DELAY_MS);
    this.controlsVisible = false;
  });

  get slides() {
    return this.args.slides || [];
  }

  get slideCount() {
    return this.slides.length;
  }

  get currentIndex() {
    if (!this.slideCount) {
      return 0;
    }

    return Math.min(Math.max(this.args.currentIndex || 0, 0), this.slideCount - 1);
  }

  get currentSlide() {
    return this.slides[this.currentIndex];
  }

  get currentSlideNumber() {
    return this.currentIndex + 1;
  }

  onInsert = (element) => {
    this.viewportElement = element;

    if (typeof this.args.onInsert === 'function') {
      this.args.onInsert(element);
    }

    this.showControlsTemporarily();
  };

  onScrollerInsert = (element) => {
    this.scrollerElement = element;
    this.scrollToIndex(this.currentIndex, false);
  };

  onPointerMove = () => {
    this.showControlsTemporarily();
  };

  onScroll = () => {
    this.showControlsTemporarily();

    if (this.scrollSettleTimer) {
      clearTimeout(this.scrollSettleTimer);
    }

    this.scrollSettleTimer = setTimeout(() => {
      this.syncIndexFromScroll();
    }, SCROLL_SETTLE_MS);
  };

  onKeydown = (event) => {
    if (event.key === 'Escape') {
      this.onClose();
    } else if (event.key === 'ArrowLeft') {
      this.goPrevious();
    } else if (event.key === 'ArrowRight') {
      this.goNext();
    }
  };

  onClose = () => {
    if (typeof this.args.onClose === 'function') {
      this.args.onClose();
    }
  };

  goPrevious = () => {
    if (!this.slideCount) {
      return;
    }

    const nextIndex = (this.currentIndex - 1 + this.slideCount) % this.slideCount;
    this.scrollToIndex(nextIndex, true);
    this.notifyIndexChange(nextIndex);
  };

  goNext = () => {
    if (!this.slideCount) {
      return;
    }

    const nextIndex = (this.currentIndex + 1) % this.slideCount;
    this.scrollToIndex(nextIndex, true);
    this.notifyIndexChange(nextIndex);
  }

  syncIndexFromScroll() {
    if (!this.scrollerElement || !this.slideCount) {
      return;
    }

    const width = this.scrollerElement.clientWidth;
    if (!width) {
      return;
    }

    const raw = this.scrollerElement.scrollLeft / width;
    const snapped = Math.round(raw);
    const index = Math.min(Math.max(snapped, 0), this.slideCount - 1);
    this.notifyIndexChange(index);
  }

  scrollToIndex(index, animated) {
    if (!this.scrollerElement) {
      return;
    }

    const width = this.scrollerElement.clientWidth;
    this.scrollerElement.scrollTo({
      left: width * index,
      behavior: animated ? 'smooth' : 'auto',
    });
  }

  notifyIndexChange(index) {
    if (typeof this.args.onChangeIndex === 'function') {
      this.args.onChangeIndex(index);
    }
  }

  showControlsTemporarily() {
    this.controlsVisible = true;
    this.hideControlsAfterIdle.perform();
  }
}
