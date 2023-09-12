import { gsap } from 'gsap';
import * as THREE from 'three';

export class FiyLine {
    constructor(toLinePoints){
        const linePoints = [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(5,4,0),
            new THREE.Vector3(13,0,0),
        ]
        console.log(toLinePoints);
        // 创建曲线
        this.lineCure = new THREE.CatmullRomCurve3(toLinePoints || linePoints);

        // 根据曲线生成 管道几何
        this.geometry = new THREE.TubeBufferGeometry(this.lineCure,100,0.2,2,false);
        // 设置飞线的材质
        // 创建纹理
        const textLoader = new THREE.TextureLoader();
        this.texture = textLoader.load('./textures/z_11.png');
        this.texture.repeat.set(1,2);
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.MirroredRepeatWrapping;
        this.material = new THREE.MeshBasicMaterial({
            color:0xfff000,
            map:this.texture,
            transparent:true
        });

        // 创建飞线物体
        this.mesh = new THREE.Mesh(this.geometry ,this.material );


        // 创建飞线动画
        gsap.to(this.texture.offset,{
            x:-1,
            duration:3,
            repeat:-1,ease:'none'
        })
    }
}