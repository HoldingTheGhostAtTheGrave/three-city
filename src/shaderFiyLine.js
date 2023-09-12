import { gsap } from 'gsap';
import * as THREE from 'three';

export class FiyShaderLine {
    constructor() {
        const linePoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(-5, 4, 0),
            new THREE.Vector3(-10, 0, 0),
        ]
        // 创建曲线
        this.lineCures = new THREE.CatmullRomCurve3(linePoints);
        const points = this.lineCures.getPoints(1000);

        // 创建几何体
        this.geometry = new THREE.BufferGeometry().setFromPoints(points);

        // 给每一个顶点设置属性
        const aSize = new Float32Array(points.length);
        for (let index = 0; index < aSize.length; index++) {
            aSize[index] = index;
        }

        // 设置几何体的顶点属性
        this.geometry.setAttribute(
            'aSize',
            new THREE.BufferAttribute(aSize, 1)
        );

        // 设置着色器材质
        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float aSize;
                varying float vSize;
                uniform float uTime;
                uniform float uLength;
                uniform vec3 uColor;
                void main(){
                    vec4 viewPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );
                    gl_Position = projectionMatrix *  viewPosition;

                    vSize = (aSize - 500.0 - uTime);
                    if(vSize<0.0){
                        vSize = vSize + uLength;
                    }
                    vSize = vSize * 0.1;
                    gl_PointSize = -vSize/viewPosition.z;
                }
            `,
            fragmentShader: `
                varying float vSize;
                uniform vec3 uColor;
                void main(){
                    float distanceToCenter = distance(gl_PointCoord , vec2(0.5));

                    float str = 1.0 - (distanceToCenter*2.0);
                    if(vSize<=0.0){
                        gl_FragColor = vec4(1.0,0,0,0.0);
                    }else{
                        gl_FragColor = vec4(uColor,str);
                    }
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms:{
                uTime:{
                    value:0
                },
                uColor:{
                    value:new THREE.Color(0xfff000)
                },
                uLength:{
                    value:points.length
                }
            }
            // side: THREE.DoubleSide
        });


        this.mesh = new THREE.Points(this.geometry, this.shaderMaterial);
        gsap.to(this.shaderMaterial.uniforms.uTime,{
            value:1000,
            duration:1,
            repeat:-1,
            ease:'none'
        })
    }
}