Pack.transforms.json = {
    event: 'output',
    apply: function(data) {
        data.target.output = JSON.stringify(data.value);
    }
};