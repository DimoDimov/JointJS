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
                        }
                    });
                };

                declareCustomElements();

                $scope.addCustomElement = addCustomElement;

                function addCustomElement(x, y, label) {
                    //creating new Element
                    var customElement = new joint.shapes.html.Element({
                        position: {
                            x: x,
                            y: y
                        },
                        size: {
                            width: 170,
                            height: 100
                        },
                        label: label,
                        select: 'one'
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

                var circle = scope.addCircle(200, 230, 'my circle');

                scope.addJoint(circle, rect);

                scope.addCustomElement(80, 180, 'I\'m custom');
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

                //add event handlers to interact with the diagram
                diagram.on('cell:pointerclick', function(cellView, evt, x, y) {

                    //your logic here e.g. select the element
                    console.log('cell:pointerclick');
                });

                diagram.on('blank:pointerclick', function(evt, x, y) {

                    // your logic here e.g. unselect the element by clicking on a blank part of the diagram
                    console.log('blank:pointerclick');
                });

                diagram.on('link:options', function(evt, cellView, x, y) {

                    // your logic here: e.g. select a link by its options tool
                    console.log('link:options');
                });
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
