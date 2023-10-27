TYPE_NORMAL  = "#283242"
TYPE_ERROR   = "#fc3f3f"
TYPE_WARNING = "#edb32b"

class Popup {  
  constructor(text, ttl, type) {
  	ttl = ttl || 1000;
    type = type || TYPE_NORMAL;
    
    this.elementID = `popup-${document.getElementsByClassName('sp-popup').length}`;
    this.container = document.createElement('div');
    this.container.classList.add('sp-popup', this.elementID);
    this.container.style = `background-color: ${type}`;
    
    this.text = document.createElement('a');
    this.text.innerHTML = text;
    this.container.append(this.text);
    
		setTimeout(() => {
      this.remove();
    }, ttl);
    
    this.container.addEventListener('click', () => {
    	this.remove();
    });

    document.getElementsByTagName('body')[0].append(this.container);
  }

  remove() {
    this.container.remove();
  }
}