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

                $scope.vm = {};
                $scope.vm.graph = new joint.dia.Graph;

                //---------Rect------------
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
                var rect = scope.addRectangle(100, 30, 'my box');

                var rect2 = scope.addRectangle(400, 30, 'my box');

                scope.addJoint(rect, rect2);

                var circle = scope.addCircle(200, 230, 'my box');

                scope.addJoint(circle, rect);
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
