# sd_visualize

1.1.3.2
To fix make the page over size while useing rtl, on plotlyjs file around js-plotly-tester: 
change the left:"-10000px", to right:"-10000px", 

x.makeTester=function(){var t=i.ensureSingleById(n.select("body"),
"svg","js-plotly-tester",
(function(t){t.attr(p.svgAttrs).style({
    position:"absolute",
    left:"-10000px",
    top:"-10000px",
    width:"9000px",
    height:"9000px",
    "z-index":"1"})}))

1.1.0
Some fundamental changes applyed

1.0.3[src](static%2Fsrc)