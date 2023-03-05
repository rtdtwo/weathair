export const fToC = (f: number | string): number => {
    return (parseInt(f.toString().trim().replace('°', '')) - 32) * (5/9)
}

export const cToF = (c: number | string): number => {
    return (parseInt(c.toString().trim().replace('°', '')) * (9/5)) + 32
}