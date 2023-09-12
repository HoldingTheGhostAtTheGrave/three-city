import * as THREE from 'three';

export default class ModifyMeshLine {
    constructor(geometry) {
        const edges = new THREE.EdgesGeometry(geometry);

        this.material = new THREE.LineBasicMaterial({ color: 0xf7f7f7 }) 
        const line = new THREE.LineSegments(
            edges, 
            this.material
        );
        this.geometry = edges;
        this.mesh = line;
    }
}


