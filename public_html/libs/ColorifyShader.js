/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {
	uniforms: {
		"tDiffuse": {type: "t", value: null},
		"color": {type: "c", value: new THREE.Color(0xffffff)}

	},
	vertexShader: [
		"varying vec2 vUv;",
		"varying vec2 pos2D;",
		"void main() {",
		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"pos2D.x = gl_Position.x;",
		"pos2D.y = gl_Position.y;",
		"}"

	].join("\n"),
	fragmentShader: [
		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",
		"varying vec2 pos2D;",
		"void main() {",
		"vec4 texel = texture2D( tDiffuse, vUv );",
		"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
		"float v = dot( texel.xyz, luma );",
		"if (pos2D.x > -0.4 && pos2D.x < 0.4 && pos2D.y > -0.5 && pos2D.y < 0.9)",
		"gl_FragColor = vec4( v * color, texel.w );",
		"else",
		"gl_FragColor = texel;",
		"}"

	].join("\n")

};
