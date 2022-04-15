import ambientLight from '../../../common/shader/ambient'
import React, { useEffect, } from 'react'
import { getWebGLContext, initShaders, Matrix4, Vector3, } from '../../../common/utils/glUtils/index'

interface BarChartCanvasProps {
    charData: number[];
}
const BarChartCanvas = function (props: BarChartCanvasProps) {

    const locationOffset = 0.6;
    useEffect(() => {
        main();
    }, [props.charData]);
    const colorOffset = 1 / props.charData.length;
    let eyeX = 0.00;
    let eyeY = 0.00;
    let eyeZ = 3.00;
    let drawFlag = false;
    let firData = 0;
    const dataCount = props.charData.length;
    const main = () => {
        console.log("in main");

        const canvas = document.getElementById('barChart');
        // Get the rendering context for WebGL
        let gl = getWebGLContext(canvas);
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        // Initialize shaders
        if (!initShaders(gl, ambientLight.vShader, ambientLight.fShader)) {
            console.log('Failed to intialize shaders.');
            return;
        }

        // 
        let n = initVertexBuffers(gl);
        if (n < 0) {
            console.log('Failed to set the vertex information');
            return;
        }

        // Set the clear color and enable the depth test
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.DEPTH_TEST);
        // Calculate the view projection matrix
        let modelMatrix = new Matrix4(null);
        let viewMatrix = new Matrix4(null);
        let scaleMatrix = new Matrix4(null);
        let projMatrix = new Matrix4(null);
        let mvpMatrix = new Matrix4(null);
        // Get the storage locations of uniform variables and so on
        let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
        let u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight');
        let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
        let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
        if (!u_MvpMatrix || !u_DiffuseLight || !u_LightDirection || !u_AmbientLight) {
            console.log('Failed to get the storage location');
            return;
        }

        // Set the light color (white)
        gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
        // Set the light direction (in the world coordinate)
        let lightDirection = new Vector3([0.5, 3.0, 4.0]);
        lightDirection.normalize();     // Normalize
        gl.uniform3fv(u_LightDirection, lightDirection.elements);
        // Set the ambient light
        gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

        viewMatrix.lookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
        projMatrix.setPerspective(90, 1, 0.5, 200);//second params is canvas.width/canvas.height
        document.addEventListener('keydown', (e) => onKeyDown(e, gl, n, u_MvpMatrix, viewMatrix, projMatrix, modelMatrix, mvpMatrix, scaleMatrix), true);
        draw(gl, n, u_MvpMatrix, viewMatrix, projMatrix, modelMatrix, mvpMatrix, scaleMatrix);


    }

    function changeColorBuffer(n: number, gl: any) {
        let color = [];
        for (let i = 0; i < 24; i++) {
            color.push((0 + colorOffset * n), (0+ colorOffset * n), (1 - colorOffset * n));
        }
        let buffer = gl.createBuffer();
        let colorBuffer = new Float32Array(color);
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, colorBuffer, gl.STATIC_DRAW);
        // Assign the buffer object to the attribute variable
        let a_attribute = gl.getAttribLocation(gl.program, 'a_Color');
        if (a_attribute < 0) {
            console.log('Failed to get the storage location of a_Color');
            return false;
        }
        gl.vertexAttribPointer(a_attribute, 3, gl.FLOAT, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_attribute);

        return true;
    };

    function initVertexBuffers(gl: { bindBuffer: (arg0: any, arg1: null) => void; ARRAY_BUFFER: any; createBuffer: () => any; ELEMENT_ARRAY_BUFFER: any; bufferData: (arg0: any, arg1: Uint8Array, arg2: any) => void; STATIC_DRAW: any; }) {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        // Coordinates
        let vertices = new Float32Array([
            0.5, 1.0, 0.5, 0.0, 1.0, 0.5, 0.0, -1.0, 0.5, 0.5, -1.0, 0.5,// v0-v1-v2-v3 front
            0.5, 1.0, 0.5, 0.5, -1.0, 0.5, 0.5, -1.0, 0.0, 0.5, 1.0, 0.0, // v0-v3-v4-v5 right
            0.5, 1.0, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.5, // v0-v5-v6-v1 up
            0.0, 1.0, 0.5, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.5, // v1-v6-v7-v2 left
            0.0, -1.0, 0.0, 0.5, -1.0, 0.0, 0.5, -1.0, 0.5, 0.0, -1.0, 0.5, // v7-v4-v3-v2 down
            0.5, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.5, 1.0, 0.0,  // v4-v7-v6-v5 back
        ]);

        // Colors
        let colors = new Float32Array([
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0      // v4-v7-v6-v5 back
        ]);

        // Normal
        let normals = new Float32Array([
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
        ]);

        // Indices of the vertices
        let indices = new Uint8Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // right
            8, 9, 10, 8, 10, 11,    // up
            12, 13, 14, 12, 14, 15,    // left
            16, 17, 18, 16, 18, 19,    // down
            20, 21, 22, 20, 22, 23     // back
        ]);

        // Write the vertex property to buffers (coordinates, colors and normals)
        if (!initArrayBuffer(gl, 'a_Position', vertices, 3)) return -1;
        if (!initArrayBuffer(gl, 'a_Color', colors, 3)) return -1;
        if (!initArrayBuffer(gl, 'a_Normal', normals, 3)) return -1;

        // Unbind the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // Write the indices to the buffer object
        let indexBuffer = gl.createBuffer();
        if (!indexBuffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        return indices.length;
    }

    function initArrayBuffer(gl: { bindBuffer: any; ARRAY_BUFFER: any; createBuffer: any; ELEMENT_ARRAY_BUFFER?: any; bufferData: any; STATIC_DRAW: any; getAttribLocation?: any; program?: any; vertexAttribPointer?: any; FLOAT?: any; enableVertexAttribArray?: any; }, attribute: string, data: Float32Array, num: number) {
        // Create a buffer object
        let buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        // Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        // Assign the buffer object to the attribute variable
        let a_attribute = gl.getAttribLocation(gl.program, attribute);
        if (a_attribute < 0) {
            console.log('Failed to get the storage location of ' + attribute);
            return false;
        }
        gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute variable
        gl.enableVertexAttribArray(a_attribute);

        return true;
    }
    const draw = (gl: any, n: number | boolean, u_MvpMatrix: any, viewMatrix: Matrix4, projMatrix: Matrix4, modelMatrix: Matrix4, mvpMatrix: Matrix4, scaleMatrix: Matrix4) => {
        console.log(eyeX , eyeY ,eyeZ )
        viewMatrix.lookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
        projMatrix.setPerspective(90, 1, 1, 200);//second params is canvas.width/canvas.height
        for (let i = 0; i < dataCount; i++) {
            if (!props.charData[i]) {
                continue;
            }
            if (props.charData[i] && !drawFlag) {
                changeColorBuffer(i, gl);
                modelMatrix.setTranslate((-3 + locationOffset * (i) ), 0, 0);
                mvpMatrix.set(projMatrix)!.multiply(viewMatrix).multiply(modelMatrix);
                // Pass the model view projection matrix to the variable u_MvpMatrix
                gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
                // Clear color and depth buffer
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                // Draw the cube
                gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
                drawFlag = true;
                firData = props.charData[i];
                continue;
            }
            modelMatrix.setTranslate((-3 + locationOffset * (i)), -(1 - (props.charData[i] / firData)), 0);
            scaleMatrix.setScale(1, (props.charData[i] / firData), 1);
            mvpMatrix.set(projMatrix)!.multiply(viewMatrix).multiply(modelMatrix).multiply(scaleMatrix);
            changeColorBuffer(i, gl);
            // Pass the model view projection matrix to the variable u_MvpMatrix
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
            // Draw the cube
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
        }
    }

    const onKeyDown = (event: KeyboardEvent, gl: any, n: number | boolean, u_MvpMatrix: any, viewMatrix: Matrix4, projMatrix: Matrix4, modelMatrix: Matrix4, mvpMatrix: Matrix4, scaleMatrix: Matrix4) => {
        switch (event.keyCode) {
            case 39:
                eyeY += 0.01;
                break;
            case 37:
                eyeY -= 0.01;
                break;
           
        }
        draw(gl, n, u_MvpMatrix, viewMatrix, projMatrix, modelMatrix, mvpMatrix, scaleMatrix);
    }


    return (
        <div
        >
            <canvas
                id="barChart"
                width="400"
                height="400" >
                Please use a browser that supports "canvas"
            </canvas>
        </div>
    )
}
export default BarChartCanvas

function e(e: any): (this: Window, ev: KeyboardEvent) => any {
    throw new Error('Function not implemented.');
}
