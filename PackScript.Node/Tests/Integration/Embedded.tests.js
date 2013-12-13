integrationTest('Embedded', function(output) {
    output('styles').containsOnce("__appendStyle = function");
    output('templates').containsOnce("__appendTemplate = function");
});
/*
            api.Output("styles").Should().ContainOnce("__appendStyle = function");
        }

        [Test]
        public void Template_render_helpers_are_only_included_once()
        {
            api.Output("templates").Should().ContainOnce("__appendTemplate = function");

*/