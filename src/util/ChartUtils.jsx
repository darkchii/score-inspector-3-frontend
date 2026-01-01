export function toggleAnnotationLabel(ctx, event) {
    const oneThirdWidth = ctx.element.width / 3;
    const chart = ctx.chart;
    const annotationOpts = chart.options.plugins.annotation.annotations.annotation;
    annotationOpts.label.enabled = !annotationOpts.label.enabled;
    annotationOpts.label.position = (event.x / ctx.chart.chartArea.width * 100) + '%';
    chart.update();
}