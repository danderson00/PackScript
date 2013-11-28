(function () {
    pack.transforms.add('json', 'output', function (data) {
        data.target.output = JSON.stringify(data.value);
    });
})();