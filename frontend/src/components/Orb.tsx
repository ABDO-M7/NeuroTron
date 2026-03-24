"use client"

import { useEffect, useRef } from "react"

interface OrbProps {
    hue?: number
    hoverIntensity?: number
    rotateOnHover?: boolean
    forceHoverState?: boolean
    backgroundColor?: string
}

export default function Orb({
    hue = 240,
    hoverIntensity = 0.2,
    rotateOnHover = true,
    forceHoverState = false,
    backgroundColor = "#000000",
}: OrbProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pointerRef = useRef({ x: 0.5, y: 0.5, hovering: false })
    const rafRef = useRef<number>()
    const startTimeRef = useRef(Date.now())

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
        if (!gl) return

        // ── Shader source ────────────────────────────────────────────
        const vert = `
            attribute vec2 a_pos;
            void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
        `
        const frag = `
            precision highp float;
            uniform vec2  u_res;
            uniform float u_time;
            uniform vec2  u_pointer;
            uniform float u_hover;
            uniform float u_hue;
            uniform float u_hoverIntensity;
            uniform float u_rotate;

            vec3 hsl2rgb(vec3 c) {
                vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0,4,2),6.0)-3.0)-1.0, 0.0, 1.0);
                return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0*c.z - 1.0));
            }

            float sdSphere(vec3 p, float r) { return length(p) - r; }

            float noise(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f*f*(3.0-2.0*f);
                float n = i.x+i.y*57.0+113.0*i.z;
                return mix(mix(mix(fract(sin(n+0.0 )*43758.5),fract(sin(n+1.0 )*43758.5),f.x),
                               mix(fract(sin(n+57.0)*43758.5),fract(sin(n+58.0)*43758.5),f.x),f.y),
                           mix(mix(fract(sin(n+113.)*43758.5),fract(sin(n+114.)*43758.5),f.x),
                               mix(fract(sin(n+170.)*43758.5),fract(sin(n+171.)*43758.5),f.x),f.y),f.z);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy / u_res) * 2.0 - 1.0;
                uv.x *= u_res.x / u_res.y;

                vec2 mouse = (u_pointer * 2.0 - 1.0);
                mouse.x *= u_res.x / u_res.y;

                float t = u_time * 0.4;
                float dist = length(uv);
                float orbR = 0.55;

                // Rotate on hover
                float angle = u_hover * u_rotate * 0.4;
                float ca = cos(angle), sa = sin(angle);
                vec2 rotUV = vec2(uv.x*ca - uv.y*sa, uv.x*sa + uv.y*ca);

                vec3 p = vec3(rotUV, sqrt(max(0.0, orbR*orbR - dot(rotUV,rotUV))));

                // Dynamic surface
                float n = noise(p * 2.5 + vec3(t, t*0.7, t*0.5));
                n += 0.5 * noise(p * 5.0 + vec3(t*1.3, t, t*0.8));
                n += 0.25 * noise(p * 10.0 + vec3(t*0.9, t*1.2, t));

                // Mouse influence
                float mDist = length(uv - mouse);
                float mInfluence = u_hover * u_hoverIntensity * smoothstep(0.8, 0.0, mDist);
                n += mInfluence;

                // Mask to sphere
                float mask = smoothstep(orbR + 0.02, orbR - 0.02, dist);

                // Color
                float hShift = u_hue/360.0 + n*0.15;
                vec3 col = hsl2rgb(vec3(hShift, 0.7 + n*0.3, 0.4 + n*0.2));

                // Rim glow
                float rim = 1.0 - smoothstep(orbR - 0.12, orbR, dist);
                col += vec3(0.3, 0.1, 0.6) * rim * 0.4;

                // Specular
                vec3 light = normalize(vec3(-1.0, 1.5, 2.0));
                float spec = pow(max(0.0, dot(normalize(p), light)), 32.0);
                col += spec * 0.5;

                gl_FragColor = vec4(col * mask, mask);
            }
        `

        const compile = (type: number, src: string) => {
            const s = gl.createShader(type)!
            gl.shaderSource(s, src)
            gl.compileShader(s)
            return s
        }
        const prog = gl.createProgram()!
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert))
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag))
        gl.linkProgram(prog)
        gl.useProgram(prog)

        // Full-screen quad
        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(prog, "a_pos")
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

        // Uniforms
        const U = (name: string) => gl.getUniformLocation(prog, name)
        const uRes = U("u_res"), uTime = U("u_time")
        const uPtr = U("u_pointer"), uHover = U("u_hover")
        const uHue = U("u_hue"), uHoverInt = U("u_hoverIntensity")
        const uRotate = U("u_rotate")

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

        const resize = () => {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
            gl.viewport(0, 0, canvas.width, canvas.height)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)

        const render = () => {
            const t = (Date.now() - startTimeRef.current) / 1000
            const hp = pointerRef.current
            const hov = forceHoverState ? 1 : hp.hovering ? 1 : 0

            gl.uniform2f(uRes, canvas.width, canvas.height)
            gl.uniform1f(uTime, t)
            gl.uniform2f(uPtr, hp.x, hp.y)
            gl.uniform1f(uHover, hov)
            gl.uniform1f(uHue, hue)
            gl.uniform1f(uHoverInt, hoverIntensity)
            gl.uniform1f(uRotate, rotateOnHover ? 1.0 : 0.0)

            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            rafRef.current = requestAnimationFrame(render)
        }
        render()

        const onMove = (x: number, y: number) => {
            const r = canvas.getBoundingClientRect()
            pointerRef.current.x = (x - r.left) / r.width
            pointerRef.current.y = 1 - (y - r.top) / r.height
        }
        const onEnter = () => { pointerRef.current.hovering = true }
        const onLeave = () => { pointerRef.current.hovering = false }
        const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY)
        const onTouch = (e: TouchEvent) => { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY) }

        canvas.addEventListener("mouseenter", onEnter)
        canvas.addEventListener("mouseleave", onLeave)
        window.addEventListener("mousemove", onMouse)
        window.addEventListener("touchmove", onTouch, { passive: true })

        return () => {
            cancelAnimationFrame(rafRef.current!)
            ro.disconnect()
            canvas.removeEventListener("mouseenter", onEnter)
            canvas.removeEventListener("mouseleave", onLeave)
            window.removeEventListener("mousemove", onMouse)
            window.removeEventListener("touchmove", onTouch)
        }
    }, [hue, hoverIntensity, rotateOnHover, forceHoverState])

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100%",
                height: "100%",
                display: "block",
                background: backgroundColor,
            }}
        />
    )
}
