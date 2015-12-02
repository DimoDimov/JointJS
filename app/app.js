(function() {
    'use strict';

    var app = angular.module('app', []);

    angular
        .module('app')
        .directive('wrapper', [function() {

            var directive = {
                controller: controller,
                link: link,
                restrict: 'E',
                scope: {},
                template: '<div><joint-diagram graph="vm.graph" width="800" height="400" grid-size="1" /></div>'
            };

            function controller($scope) {
                //data coming from back end
                $scope.backendData = [{
                    customElType: 'customEl',
                    x: 80,
                    y: 230,
                    label: 'I\'m custom',
                    select: 'two',
                    input: 'custom yeaa'
                }];

                console.log("wrapper Ctrl");

                function declareCustomElements() {
                    // declare a custom element.
                    // ------------------------

                    joint.shapes.html = joint.shapes.html || {};

                    joint.shapes.html.Element = joint.shapes.basic.Rect.extend({
                        defaults: joint.util.deepSupplement({
                            type: 'html.Element',
                            attrs: {
                                rect: {
                                    stroke: 'none',
                                    'fill-opacity': 0
                                }
                            }
                        }, joint.shapes.basic.Rect.prototype.defaults)
                    });

                    // Create a custom view for that element that displays an HTML div above it.
                    // -------------------------------------------------------------------------

                    joint.shapes.html.ElementView = joint.dia.ElementView.extend({

                        template: [
                            '<div class="html-element">',
                            '<button class="delete">x</button>',
                            '<button class="add">+</button>',
                            '<label></label>',
                            '<span></span>', '<br/>',
                            '<select><option>--</option><option>one</option><option>two</option></select>',
                            '<input type="text" value="I\'m HTML input" />',
                            '</div>'
                        ].join(''),

                        initialize: function() {
                            _.bindAll(this, 'updateBox');
                            joint.dia.ElementView.prototype.initialize.apply(this, arguments);

                            this.$box = $(_.template(this.template)());
                            // Prevent paper from handling pointerdown.
                            this.$box.find('input,select').on('mousedown click', function(evt) {
                                evt.stopPropagation();
                            });
                            // This is an example of reacting on the input change and storing the input data in the cell model.
                            this.$box.find('input').on('change', _.bind(function(evt) {
                                this.model.set('input', $(evt.target).val());
                            }, this));
                            this.$box.find('select').on('change', _.bind(function(evt) {
                                this.model.set('select', $(evt.target).val());
                            }, this));
                            this.$box.find('select').val(this.model.get('select'));
                            this.$box.find('input').val(this.model.get('input'));

                            this.$box.find('.add').on('click', _.bind(this.addLink, this));

                            this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
                            // Update the box position whenever the underlying model changes.
                            this.model.on('change', this.updateBox, this);
                            // Remove the box when the model gets removed from the graph.
                            this.model.on('remove', this.removeBox, this);

                            this.updateBox();
                        },
                        render: function() {
                            joint.dia.ElementView.prototype.render.apply(this, arguments);
                            this.paper.$el.prepend(this.$box);
                            this.updateBox();
                            return this;
                        },
                        updateBox: function() {
                            // Set the position and dimension of the box so that it covers the JointJS element.
                            var bbox = this.model.getBBox();
                            // Example of updating the HTML with a data stored in the cell model.
                            this.$box.find('label').text(this.model.get('label'));
                            this.$box.find('span').text(this.model.get('select'));
                            this.$box.find('input').val(this.model.get('input'));

                            this.$box.css({
                                width: bbox.width,
                                height: bbox.height,
                                left: bbox.x,
                                top: bbox.y,
                                transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'
                            });
                        },
                        removeBox: function(evt) {
                            this.$box.remove();
                        },
                        addLink: function(evt) {

                            var theOnlyLink = new joint.dia.Link({
                                source: {
                                    id: this.model.id
                                },
                                target: {
                                    x: this.model.position().x + this.model.attributes.size.width + 100,
                                    y: this.model.position().y + this.model.attributes.size.height / 2
                                },
                                attrs: {
                                    sourceCellView: this
                                },
                            });

                            theOnlyLink.attr({
                                '.connection': {
                                    stroke: '#31d0c6',
                                    'stroke-width': 3,
                                    'stroke-dasharray': '5 2'
                                },
                                '.marker-target': {
                                    stroke: '#31d0c6',
                                    fill: '#31d0c6',
                                    d: 'M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z'
                                },
                                '.marker-source': {
                                    stroke: '#31d0c6',
                                    fill: '#31d0c6',
                                    d: 'M4.834,4.834L4.833,4.833c-5.889,5.892-5.89,15.443,0.001,21.334s15.44,5.888,21.33-0.002c5.891-5.891,5.893-15.44,0.002-21.33C20.275-1.056,10.725-1.056,4.834,4.834zM25.459,5.542c0.833,0.836,1.523,1.757,2.104,2.726l-4.08,4.08c-0.418-1.062-1.053-2.06-1.912-2.918c-0.859-0.859-1.857-1.494-2.92-1.913l4.08-4.08C23.7,4.018,24.622,4.709,25.459,5.542zM10.139,20.862c-2.958-2.968-2.959-7.758-0.001-10.725c2.966-2.957,7.756-2.957,10.725,0c2.954,2.965,2.955,7.757-0.001,10.724C17.896,23.819,13.104,23.817,10.139,20.862zM5.542,25.459c-0.833-0.837-1.524-1.759-2.105-2.728l4.081-4.081c0.418,1.063,1.055,2.06,1.914,2.919c0.858,0.859,1.855,1.494,2.917,1.913l-4.081,4.081C7.299,26.982,6.379,26.292,5.542,25.459zM8.268,3.435l4.082,4.082C11.288,7.935,10.29,8.571,9.43,9.43c-0.858,0.859-1.494,1.855-1.912,2.918L3.436,8.267c0.58-0.969,1.271-1.89,2.105-2.727C6.377,4.707,7.299,4.016,8.268,3.435zM22.732,27.563l-4.082-4.082c1.062-0.418,2.061-1.053,2.919-1.912c0.859-0.859,1.495-1.857,1.913-2.92l4.082,4.082c-0.58,0.969-1.271,1.891-2.105,2.728C24.623,26.292,23.701,26.983,22.732,27.563z'
                                }
                            });

                            this.$box.find('.add').hide();

                            $scope.vm.graph.addCell(theOnlyLink);
                        },
                        showAddButton: function(evt) {

                            this.$box.find('.add').show();
                        }
                    });
                };

                declareCustomElements();

                $scope.addCustomElement = addCustomElement;

                //x, y, label, select, input
                function addCustomElement(el) {
                    //creating new Element
                    var customElement = new joint.shapes.html.Element({
                        position: {
                            x: el.x,
                            y: el.y
                        },
                        size: {
                            width: 170,
                            height: 100
                        },
                        label: el.label,
                        select: el.select,
                        input: el.input
                    });

                    $scope.vm.graph.addCell(customElement);

                    return customElement
                };

                //-----------------Setting the graph ------------
                $scope.vm = {};
                $scope.vm.graph = new joint.dia.Graph;

                //---------Rect--------------------------------
                $scope.addRectangle = addRectangle;

                function addRectangle(x, y, label) {
                    var rect = new joint.shapes.basic.Rect({
                        position: {
                            x: x,
                            y: y
                        },
                        size: {
                            width: 100,
                            height: 30
                        },
                        attrs: {
                            rect: {
                                fill: 'blue'
                            },
                            text: {
                                text: label,
                                fill: 'white'
                            }
                        }
                    });

                    $scope.vm.graph.addCell(rect);
                    return rect;
                };

                //----------------------Circle-----------------
                $scope.addCircle = addCircle;

                function addCircle(x, y, label) {

                    var circle = new joint.shapes.basic.Circle({
                        position: {
                            x: x,
                            y: y
                        },
                        size: {
                            width: 100,
                            height: 100
                        },
                        attrs: {
                            text: {
                                text: label
                            }
                        }
                    });

                    $scope.vm.graph.addCell(circle);
                    return circle;
                };

                //------------Add Joint-----------------
                $scope.addJoint = addJoint;

                function addJoint(source, target) {

                    var link = new joint.dia.Link({
                        source: {
                            id: source.id
                        },
                        target: {
                            id: target.id
                        }
                    });

                    $scope.vm.graph.addCell(link);
                    return link;
                };
            };

            function link(scope, element, attrs) {
                console.log("wrapper link creates elements after paper is being initialized");

                var rect = scope.addRectangle(100, 30, 'my box');

                var rect2 = scope.addRectangle(400, 30, 'my box');

                scope.addJoint(rect, rect2);

                var circle = scope.addCircle(480, 230, 'my circle');

                scope.addJoint(circle, rect);

                //we need to save the rendered elements for tracking by ID
                var customElList = [];

                var el;
                for (var i = 0; i < scope.backendData.length; i++) {
                    //customElType:'customEl'
                    el = scope.backendData[i];
                    if (el.customElType === 'customEl') {
                        customElList.push(scope.addCustomElement(el));
                    };
                };

            };

            return directive;

        }]);

    angular
        .module('app')
        .directive('jointDiagram', [function() {

            var directive = {
                link: link,
                restrict: 'E',
                scope: {
                    height: '=',
                    width: '=',
                    gridSize: '=',
                    graph: '=',
                }
            };

            return directive;

            function link(scope, element, attrs) {

                var someService = {};

                var diagram = newDiagram(scope.height, scope.width, scope.gridSize, scope.graph, element[0]);

                //handles the remove link actions
                scope.graph.on('remove', function(cell, collection, opt) {

                    if (cell.isLink()) {

                        var sourceCellView = cell.get('attrs').sourceCellView;

                        sourceCellView.showAddButton();
                    }
                });

                //-------------testing functions------------
                //add event handlers to interact with the diagram
                scope.graph.on('cell:pointerclick', function(cellView, evt, x, y) {

                    //your logic here e.g. select the element
                    console.log('cell:pointerclick');
                });

                scope.graph.on('blank:pointerclick', function(evt, x, y) {

                    // your logic here e.g. unselect the element by clicking on a blank part of the diagram
                    console.log('blank:pointerclick');
                });

                scope.graph.on('link:options', function(evt, cellView, x, y) {

                    // your logic here: e.g. select a link by its options tool
                    console.log('link:options');
                });

                scope.graph.on('cell:pointerdown',
                    function(cellView, evt, x, y) {
                        console.log('cell view ' + cellView.model.id + ' was clicked');
                    }
                );
            };

            function newDiagram(height, width, gridSize, graph, targetElement) {
                console.log("jointDiagram Link");

                var paper = new joint.dia.Paper({
                    el: targetElement,
                    width: width,
                    height: height,
                    gridSize: gridSize,
                    model: graph,
                });

                return paper;
            };

        }]);

})();
