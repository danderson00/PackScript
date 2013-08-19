function wrap(value, output, target, options) {
    return {
        value: value,
        output: output,
        target: target || new Pack.Container(),
        options: options || {}
    };
}