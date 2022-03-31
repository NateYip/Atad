import ambientLight from '../../common/shader/ambient'
import React, { useEffect } from 'react'
import { getWebGLContext, initShaders, Matrix4, Vector3, } from '../../common/utils/glUtils/index'
const BarChart = () => {
    useEffect(() => {
        main();
    });
    const main = () => {
        const canvas = document.getElementById('barChart');
        if (!canvas) {
            console.log('failed to get canvas');
        }
        let gl = getWebGLContext(canvas);
        if (!gl) {
            console.log('failed to get webGL context');
        }
        if (!initShaders(gl, ambientLight.vShader, ambientLight.fShader)) {
            console.log('failed to initialize shader');
        }
        let n = initVertexBuffers(gl);

        if (n < 0) {
            console.log('Failed to initialize buffers');
            return;
        }

        // Set the clear color and enable the depth test
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        // Get the storage locations of uniform letiables and so on
        let u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
        let u_normalMatrix = gl.getUniformLocation(gl.program, 'u_normalMatrix');
        let u_LightDir = gl.getUniformLocation(gl.program, 'u_LightDir');
        if (!u_mvpMatrix || !u_normalMatrix || !u_LightDir) {
            console.log('Failed to get the storage location');
            return;
        }

        // Set the viewing volume
        let viewMatrix = new Matrix4!(null);   // View matrix
        let mvpMatrix = new Matrix4!(null);    // Model view projection matrix
        let mvMatrix = new Matrix4!(null);     // Model matrix
        let normalMatrix = new Matrix4!(null); // Transformation matrix for normals
        if (!viewMatrix || !mvpMatrix || !mvMatrix || !normalMatrix) {
            console.error("matrix4 create error");
            return;
        }
        // Calculate the view matrix
        viewMatrix.setLookAt(0, 3, 10, 0, 0, 0, 0, 1, 0);
        mvMatrix.set(viewMatrix)!.rotate(60, 0, 1, 0); // Rotate 60 degree around the y-axis
        // Calculate the model view projection matrix
        mvpMatrix.setPerspective(30, 1, 1, 100);
        mvpMatrix.multiply(mvMatrix);
        // Calculate the matrix to transform the normal based on the model matrix
        normalMatrix.setInverseOf(mvMatrix);
        normalMatrix.transpose();

        // Pass the model view matrix to u_mvpMatrix
        gl!.uniformMatrix4fv(u_mvpMatrix, false, mvpMatrix.elements);

        // Pass the normal matrixu_normalMatrix
        gl!.uniformMatrix4fv(u_normalMatrix, false, normalMatrix.elements);

        // Pass the direction of the diffuse light(world coordinate, normalized)
        let lightDir = new Vector3([1.0, 1.0, 1.0]);
        lightDir.normalize();     // Normalize
        let lightDir_eye = viewMatrix.multiplyVector3(lightDir); // Transform to view coordinate
        lightDir_eye.normalize(); // Normalize
        gl!.uniform3fv(u_LightDir, lightDir_eye.elements);

        // Clear color and depth buffer
        gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);

        // Draw the cube
        gl!.drawElements(gl!.TRIANGLES, (n as any), gl!.UNSIGNED_BYTE, 0);

    }

    const initVertexBuffers = (gl: any) => {
        let vertices = new Float32Array([
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
            1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
            1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
            -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
            1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0  // v4-v7-v6-v5 back
        ]);

        // Colors
        let colors = new Float32Array([
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
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
        initArrayBuffer(gl, vertices, 3, 'a_Position');
        initArrayBuffer(gl, colors, 3, 'a_Color');
        initArrayBuffer(gl, normals, 3, 'a_Normal');

        // Unbind the buffer object
        gl!.bindBuffer(gl!.ARRAY_BUFFER, null);

        // Write the indices to the buffer object
        let indexBuffer = gl!.createBuffer();
        if (!indexBuffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, indices, gl!.STATIC_DRAW);

        return indices.length;
    }

    const initArrayBuffer = (gl: any, data: any, num: number, attribute: string) => {
        // Create a buffer object
        let buffer = gl!.createBuffer();
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        // Write date into the buffer object
        gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
        gl!.bufferData(gl!.ARRAY_BUFFER, data, gl!.STATIC_DRAW);
        // Assign the buffer object to the attribute letiable
        let a_attribute = gl!.getAttribLocation(gl!.program, attribute);
        if (a_attribute < 0) {
            console.log('Failed to get the storage location of ' + attribute);
            return false;
        }
        gl!.vertexAttribPointer(a_attribute, 3, gl!.FLOAT, false, 0, 0);
        // Enable the assignment of the buffer object to the attribute letiable
        gl!.enableVertexAttribArray(a_attribute);

        return true;
    }
    return (
        <div onLoad={main}>
            <canvas id="barChart" width="400" height="400">
                Please use a browser that supports "canvas"
            </canvas>
        </div>

    )
}
export default BarChart