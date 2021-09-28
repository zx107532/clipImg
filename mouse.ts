export default class Mouse {
  constructor() {
    this.init();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  scrollUp() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  scrollDown() {}

  init() {
    /*IE、Opera注册事件*/
    // if (window.document?.attachEvent) {
    //   window.document.attachEvent("onmousewheel", this.scrollFunc.bind(this));
    // }
    //Firefox使用addEventListener添加滚轮事件
    if (window.document.addEventListener) {
      //firefox
      window.document.addEventListener(
        "DOMMouseScroll",
        this.scrollFunc.bind(this),
        false
      );
    }

    //Safari与Chrome属于同一类型
    // window.onmousewheel = () => {};
    // window.document.onmousewheel = () => {};
    window.addEventListener("mousewheel", this.scrollFunc.bind(this));
    // window.addEventListener('mousewheel', this.scrollFunc.bind(this))
    // window.onmousewheel = window.document.onmousewheel = this.scrollFunc.bind(
    //   this
    // );
    /*
   event.wheelDelta 滚动方向
   上：120
   下：-120
   Firefox：event.detail 滚动方向
   上：-3
   下:3
   */
  }

  scrollFunc(e: any) {
    e = e || window.event;
    if (e.wheelDelta) {
      //判断浏览器IE，谷歌滑轮事件
      if (e.wheelDelta > 0) {
        //当滑轮向上滚动时
        // console.log('上滚')
        this.scrollUp();
      }
      if (e.wheelDelta < 0) {
        //当滑轮向下滚动时
        // console.log('下滚')
        this.scrollDown();
      }
    } else if (e.detail) {
      //Firefox滑轮事件
      if (e.detail > 0) {
        //当滑轮向下滚动时
        // console.log('下滚')
        this.scrollDown();
      }
      if (e.detail < 0) {
        //当滑轮向上滚动时
        // console.log('上滚')
        this.scrollUp();
      }
    }
  }
}
