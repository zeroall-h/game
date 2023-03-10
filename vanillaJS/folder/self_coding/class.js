class Hero {
	constructor(el){
		this.el = document.querySelector(el);
    this.movex = 0;
    this.speed = 11;
    this.direction = 'right';
    this.attackDamage = 1000;
    this.parentNode = document.querySelector('.hero_box')
	}
	keyMotion(){
		if(key.keyDown['left']){
      this.direction='left'
			this.el.classList.add('run');
			this.el.classList.add('flip');
      this.movex = this.movex <=0? 0: this.movex - this.speed;
		}else if(key.keyDown['right']){
      this.direction = 'right'
			this.el.classList.add('run');
			this.el.classList.remove('flip');
      this.movex = this.movex + this.speed;
		}
    // jump 추가
    if(key.keyDown['jump'] && this.direction == 'left'){
      this.el.classList.add('jump');
			this.el.classList.add('flip');
      setTimeout(() => this.el.classList.remove('jump'), 500);
		} else if(key.keyDown['jump'] && this.direction == 'right'){
      this.el.classList.add('jump');
			this.el.classList.remove('flip');
      setTimeout(() => this.el.classList.remove('jump'), 500);
    }
    // jump 추가 끝

		if(key.keyDown['attack'] && !key.keyDown['jump']){
      if(!bulletComProp.launch){
        this.el.classList.add('attack');
        bulletComProp.arr.push(new Bullet());	
        bulletComProp.launch=true;
      }
				}

        if(key.keyDown['attack'] && key.keyDown['jump']){
          if(!bulletComProp.launch){
            this.el.classList.add('attack');
            bulletComProp.arr.push(new Bullet());	
            bulletComProp.launch=true;
          }
            }

		if(!key.keyDown['left'] && !key.keyDown['right']){
			this.el.classList.remove('run');
		}

		if(!key.keyDown['attack']){
			this.el.classList.remove('attack');
      bulletComProp.launch=false;
 
		}
    this.el.parentNode.style.transform = `translateX(${this.movex}px)`
	}
  // 캐릭터 위치값 알아내기
  position(){
    return{
      left:this.el.getBoundingClientRect().left,
      right:this.el.getBoundingClientRect().right,
      top: gameProp.screenHeight - this.el.getBoundingClientRect().top,
      bottom : gameProp.screenHeight- this.el.getBoundingClientRect().top-this.el.getBoundingClientRect().height
    }
  }
  size(){
    return{
      width: this.el.offsetWidth,
      height: this.el.offsetHeight
    }
  }
}

class Bullet{
  constructor(){
    this.parentNode = document.querySelector('.game');
    this.el = document.createElement('div');
    this.el.className = 'hero_bullet';
    this.x = 0;
    this.y = 0;
    this.speed = 30;
    this.distance = 0;
    this.bulletDirection = 'right';
    this.init();
  }
  init(){
    this.bulletDirection = hero.direction === 'left' ? 'left' : 'right';
    this.x=this.bulletDirection === 'right' ? hero.movex + hero.size().width/2 : hero.movex - hero.size().width/2
    this.y=hero.position().bottom - hero.size().height/2;
    this.distance=this.x;
    this.el.style.transform = `translate(${this.x}px, ${this.y}px)`
    this.parentNode.appendChild(this.el);
  }
  moveBullet(){
    let setRotate ='';
    if(this.bulletDirection === 'left'){
      this.distance -= this.speed;
      setRotate = 'rotate(180deg)'
    }else{
      this.distance += this.speed;
    }
    this.el.style.transform=`translate(${this.distance}px, ${this.y}px) ${setRotate}`;
    this.crashBullet();  
  }
  position(){
    return{
      left:this.el.getBoundingClientRect().left,
      right:this.el.getBoundingClientRect().right,
      top: gameProp.screenHeight - this.el.getBoundingClientRect().top,
      bottom : gameProp.screenHeight- this.el.getBoundingClientRect().top-this.el.getBoundingClientRect().height
    }
  }
  crashBullet(){
    for(let j = 0;j<allMonsterComProp.arr.length;j++){
      if(this.position().left > allMonsterComProp.arr[j].position().left && this.position().right < allMonsterComProp.arr[j].position().right){
        for(let i=0;i<bulletComProp.arr.length;i++){
          if(bulletComProp.arr[i] === this){
            bulletComProp.arr.splice(i,1);
            this.el.remove();
            allMonsterComProp.arr[j].updateHp(j);
          }
        }
      }
    }

    if(this.position().left> gameProp.screenWidth || this.position().right<0){
      for(let i=0;i<bulletComProp.arr.length;i++){
        if(bulletComProp.arr[i] === this){
          bulletComProp.arr.splice(i,1);
          this.el.remove();
        }
      }
    }
  }
}

class Monster{
  constructor(positionX, hp){
    this.parentNode = document.querySelector('.game');
    this.el = document.createElement('div');
    this.el.className = 'monster_box';
    this.elChildren = document.createElement('div');
    this.elChildren.className = 'monster'
    this.hpNode = document.createElement('div');
    this.hpNode.className = 'hp';
    this.hpValue = hp;
    this.defalutHpValue = hp;
    this.hpInner = document.createElement('span');
    this.progress = 0;
    this.positionX = positionX;
    this.moveX = 0;
    this.speed = 10;
    this.init()
  }
  init(){
    this.hpNode.appendChild(this.hpInner);
    this.el.appendChild(this.hpNode);
    this.el.appendChild(this.elChildren);
    this.parentNode.appendChild(this.el);
    this.el.style.left = this.positionX + 'px'
  }
  // 몬스터 위치값 알아내기
  position(){
    return{
      left:this.el.getBoundingClientRect().left,
      right:this.el.getBoundingClientRect().right,
      top: gameProp.screenHeight - this.el.getBoundingClientRect().top,
      bottom : gameProp.screenHeight- this.el.getBoundingClientRect().top-this.el.getBoundingClientRect().height
    }
  }
  updateHp(index){
      this.hpValue = Math.max(0,this.hpValue - hero.attackDamage);
      this.progress = this.hpValue / this.defalutHpValue * 100;
      this.el.children[0].children[0].style.width = this.progress + '%'

      if(this.hpValue === 0){
          this.dead(index);
      }    
  }
  dead(index){
    this.el.classList.add('remove');
    setTimeout(()=>this.el.remove(), 200);
    allMonsterComProp.arr.splice(index,1)
  }
  moveMonster(){
     // 1. 몬스터 이동 거리 2. 몬스터 속도
     this.moveX -= this.speed;
     this.el.style.transform = `translateX(${this.moveX}px)`
     if(this.moveX + this.positionX + this.el.offsetWidth - hero.movex + hero.position().left <= 0){
      this.moveX = hero.movex - this.positionX + gameProp.screenWidth - hero.position().left;
     }else {
      this.moveX -= this.speed;
     }
  }
}

// 1. 히어로의 공격력
// 2. 몬스터 체력 관리