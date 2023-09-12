import * as THREE from 'three';

export default class AlarmSprite {
    constructor(camera) {
        const texture = new THREE.TextureLoader().load("./textures/warning.png");
        const material = new THREE.SpriteMaterial({ map: texture });

        this.mesh = new THREE.Sprite(material);


        // 设置位置
        this.mesh.position.set(-4.2 , 3.5,-1);

        this.fns = [];

        // 创建射线
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        // 事件侦听
        window.addEventListener('click',(event) => {
            this.mouse.x = event.clientX/window.innerWidth*2-1; // [-1 , 1]
            this.mouse.y = -(event.clientY/window.innerHeight*2-1); // [-1 , 1]
            event.mesh = this.mesh;
            this.raycaster.setFromCamera(this.mouse,camera);
            const intersects = this.raycaster.intersectObject(this.mesh);
            if(intersects.length > 0 ){
                this.fns.forEach(fn => fn(event));
            }
        })
    }
    onClick(callback){
        this.fns.push(callback);
    }
}