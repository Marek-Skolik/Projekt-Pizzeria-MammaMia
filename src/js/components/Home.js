import {  templates } from '../settings.js';

class Home{
  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.initWidgets();
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.homeWidget();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.innerHTML = generatedHTML;
  }

  initWidgets(){
    const elem = document.querySelector('.main-carousel');

    new Flickity (elem, {
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      prevNextButtons: false,
      wrapAround: true,
      imagesLoaded: true,
    });
  }
}
export default Home;