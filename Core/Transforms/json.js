Pack.transforms.json = {
    event: 'output',
    apply: function(data, pack) {
        data.target.output = JSON.stringify(data.value);
    }
};