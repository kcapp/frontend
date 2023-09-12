const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            firstDart: null,
            secondDart: null,
            hitsMap: null,
            hits: []
        }
    },
    onMount() {
        document.write('<script type="text/javascript" src="https://d3js.org/d3.v7.min.js"><\/script>');
    },
    updateHeatmap() {
        // Remove the old heatmap
        d3.select("#heatmap").selectAll("*").remove();

        const singles = this.state.hitsMap.get(1);
        const doubles = this.state.hitsMap.get(2);
        const triples = this.state.hitsMap.get(3);

        // Set up the heatmap container dimensions
        const width = 500;
        const height = 500;

        // Create the heatmap SVG element
        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", width)
            .attr("height", height)

        // Load the SVG image as a background image
        svg.append("image")
            .attr("href", "/images/dartboard.svg")
            .attr("width", width)
            .attr("height", height);

        // Define the radius of the dartboard and the center coordinates
        const dartboardRadius = Math.min(width, height) / 2 - 10;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Determine the maximum value
        const maxHits = Math.max(
            Math.max(...singles.values()),
            Math.max(...doubles.values()),
            Math.max(...triples.values()));

        const dartNumbers = [ 20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5 ];
        const angleScale = d3.scaleBand()
            .domain(dartNumbers)
            .range([0, Math.PI * 2]);

        // Define the color scale for the heatmap
        const colorScale = d3.scaleSequential(d3.schemeCategory10)
            .domain([0, maxHits]);

        // Define the radius scale for the heatmap circles
        const radiusScale = d3.scaleLinear()
            .domain([0, maxHits])
            .range([0, 20]);

        const tooltip = d3.select("#heatmap")
            .append("div")
            .attr("class", "d3tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden");
        function appendValues(svg, numbers, clazz, valueMap, centerDistance, sizeAdjustment) {
            svg.selectAll(`circle.${clazz}`)
                .data(numbers)
                .enter()
                .append("circle")
                .attr("class", clazz)
                .attr("cx", function(d) {
                    if (d === 0) return 40;
                    const angle = angleScale(d);
                    return d === 25 ? centerX : centerX + Math.sin(angle) * dartboardRadius * centerDistance;
                })
                .attr("cy", function(d) {
                    if (d === 0) return 40;
                    const angle = angleScale(d);
                    return d === 25 ? centerY : centerY - Math.cos(angle) * dartboardRadius * centerDistance;
                })
                .attr("r", function(d) {
                    return radiusScale(valueMap.get(d) || 0);
                })
                //.attr("r", (d) => Math.sqrt(valueMap.get(d) || 0) * sizeAdjustment)
                .style("fill", function(d) {
                    return colorScale(valueMap.get(d) || 0);
                })
                .on("mouseover", function(event, d) {
                    const mouseCoordinates = d3.pointer(event);
                    const formatDart = (num) => {
                        switch (num) {
                            case 0: return "Miss";
                            case 25: return "Bullseye";
                        }
                        let prefix = '';
                        switch (clazz) {
                            case "double": prefix = "D-"; break;
                            case "triple": prefix = "T-"; break;
                        }
                        return `${prefix}${num}`;
                    };

                    let html = `Dart: ${formatDart(d)} <br>Hits: ${(valueMap.get(d) || 0)}`;
                    tooltip.style("visibility", "visible")
                        .style("display", "block")
                        .html(html)
                        .style("left", `${mouseCoordinates[0]}px`)
                        .style("top", `${mouseCoordinates[1]}px`);
                })
                .on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });
        }
        appendValues(svg, dartNumbers, "single", singles, 0.6, 4);
        appendValues(svg, dartNumbers, "double", doubles, 0.76, 2);
        appendValues(svg, dartNumbers,  "triple", triples, 0.47, 2);
        appendValues(svg, [ 25 ], "bullseye", new Map([ ...singles, ...doubles ]), 0, 3);
        appendValues(svg, [ 0 ], "miss", singles, 0, 1);
    },
    onDartChange(dartIdx, dart) {
        this.state[dartIdx] = dart;
        this.getHits(this.state.firstDart, this.state.secondDart);
    },
    getHits(firstDart, secondDart) {
        if (firstDart === null) {
            return;
        }
        const body = {
            first_dart: { value: firstDart.value, multiplier: firstDart.multiplier },
        };
        if (this.state.secondDart) {
            body.second_dart = { value: secondDart.value, multiplier: secondDart.multiplier };
        }
        const base = `${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}`;
        axios.put(`${base}/player/${this.input.player.id}/hits`, body )
            .then(response => {
                this.state.hits = response.data;

                const hitsMap = new Map(); 
                hitsMap.set(1, new Map());
                hitsMap.set(2, new Map());
                hitsMap.set(3, new Map());

                this.state.hits.map(visit => {
                    function update(dart, count) {
                        const multiplier = dart.multiplier;
                        const value = dart.value;
                        
                        const map = hitsMap.get(multiplier);
                        if (!map.get(value)) {
                            map.set(value, 0);
                        } 
                        map.set(value, map.get(value) + count);
                    }
                    if (this.state.firstDart && !this.state.secondDart) {
                        update(visit.second_dart, visit.count);
                    }
                    if (this.state.secondDart) {
                        update(visit.third_dart, visit.count);
                    }
                });
                this.state.hitsMap = hitsMap;
                console.log(hitsMap);
                this.updateHeatmap();
            }).catch(error => {
                console.log(`Error when getting hits for player ${error}`);
            });
    }
}