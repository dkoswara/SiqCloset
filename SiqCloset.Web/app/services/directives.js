(function() {
    'use strict';

    var app = angular.module('app');

    app.directive('ccSidebar', ['$window', function ($window) {
        // Repositions the sidebar on window resize 
        // and opens and closes the sidebar menu.
        // Usage:
        //  <div data-cc-sidebar>
        // Creates:
        //  <div data-cc-sidebar class="sidebar">
        var directive = {
            link: link,
            restrict: 'A'
        };
        var $win = $($window);
        return directive;

        function link(scope, element, attrs) {
            var $sidebarInner = element.find('.sidebar-inner');
            var $dropdownElement = element.find('.sidebar-dropdown a');
            element.addClass('sidebar');
            $win.resize(resize);
            $dropdownElement.click(dropdown);

            function resize() {
                $win.width() >= 765 ? $sidebarInner.slideDown(350) : $sidebarInner.slideUp(350);
            }

            function dropdown(e) {
                var dropClass = 'dropy';
                e.preventDefault();
                if (!$dropdownElement.hasClass(dropClass)) {
                    hideAllSidebars();
                    $sidebarInner.slideDown(350);
                    $dropdownElement.addClass(dropClass);
                } else if ($dropdownElement.hasClass(dropClass)) {
                    $dropdownElement.removeClass(dropClass);
                    $sidebarInner.slideUp(350);
                }

                function hideAllSidebars() {
                    $sidebarInner.slideUp(350);
                    $('.sidebar-dropdown a').removeClass(dropClass);
                }
            }
        }
    }]);

    app.directive('ccWidgetClose', function () {
        // Usage:
        // <a data-cc-widget-close></a>
        // Creates:
        // <a data-cc-widget-close="" href="#" class="wclose">
        //     <i class="icon-remove"></i>
        // </a>
        var directive = {
            link: link,
            template: '<i class="icon-remove"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('href', '#');
            attrs.$set('wclose');
            element.click(close);

            function close(e) {
                e.preventDefault();
                element.parent().parent().parent().hide(100);
            }
        }
    });

    app.directive('ccWidgetMinimize', function () {
        // Usage:
        // <a data-cc-widget-minimize></a>
        // Creates:
        // <a data-cc-widget-minimize="" href="#"><i class="icon-chevron-up"></i></a>
        var directive = {
            link: link,
            template: '<i class="icon-chevron-up"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            //$('body').on('click', '.widget .wminimize', minimize);
            attrs.$set('href', '#');
            attrs.$set('wminimize');
            element.click(minimize);

            function minimize(e) {
                e.preventDefault();
                var $wcontent = element.parent().parent().next('.widget-content');
                var iElement = element.children('i');
                if ($wcontent.is(':visible')) {
                    iElement.removeClass('icon-chevron-up');
                    iElement.addClass('icon-chevron-down');
                } else {
                    iElement.removeClass('icon-chevron-down');
                    iElement.addClass('icon-chevron-up');
                }
                $wcontent.toggle(500);
            }
        }
    });

    app.directive('ccScrollToTop', ['$window',
        // Usage:
        // <span data-cc-scroll-to-top></span>
        // Creates:
        // <span data-cc-scroll-to-top="" class="totop">
        //      <a href="#"><i class="icon-chevron-up"></i></a>
        // </span>
        function ($window) {
            var directive = {
                link: link,
                template: '<a href="#"><i class="icon-chevron-up"></i></a>',
                restrict: 'A'
            };
            return directive;

            function link(scope, element, attrs) {
                var $win = $($window);
                element.addClass('totop');
                $win.scroll(toggleIcon);

                element.find('a').click(function (e) {
                    e.preventDefault();
                    // Learning Point: $anchorScroll works, but no animation
                    //$anchorScroll();
                    $('body').animate({ scrollTop: 0 }, 500);
                });

                function toggleIcon() {
                    $win.scrollTop() > 300 ? element.slideDown(): element.slideUp();
                }
            }
        }
    ]);

    app.directive('ccSpinner', ['$window', function ($window) {
        // Description:
        //  Creates a new Spinner and sets its options
        // Usage:
        //  <div data-cc-spinner="vm.spinnerOptions"></div>
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            scope.spinner = null;
            scope.$watch(attrs.ccSpinner, function (options) {
                if (scope.spinner) {
                    scope.spinner.stop();
                }
                scope.spinner = new $window.Spinner(options);
                scope.spinner.spin(element[0]);
            }, true);
        }
    }]);

    app.directive('ccWidgetHeader', function() {
        //Usage:
        //<div data-cc-widget-header title="vm.map.title"></div>
        var directive = {
            link: link,
            scope: {
                'title': '@',
                'subtitle': '@',
                'rightText': '@',
                'allowCollapse': '@'
            },
            templateUrl: '/app/layout/widgetheader.html',
            restrict: 'A',
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('class', 'widget-head');
        }
    });

    app.directive('ccWip', ['$state', function ($state) {
        //Usage:
        //<li data-cc-wip
        //wip="vm.wip"
        //states="vm.states"
        //changed-event="{{vm.wipChangedEvent}}"
        //        class="nlightblue"></li>

        var directive = {
            controller: ['$scope', wipController],
            link: link,
            scope: {
                'wip': '=',
                'changedEvent': '@',
                'states': '=',
            },
            template: getTemplate(),
            restrict: 'A',
        };

        var wipStateName = 'wip';

        return directive;

        function wipController($scope) {
            $scope.wipExists = function () { return !!$scope.wip.length; };
            $scope.wipState = undefined;
            $scope.getWipClass = function() {
                return $scope.wipExists() ? 'icon-asterisk-alert' : '';
            }

            activate();

            function activate() {
                var eventName = $scope.changedEvent;
                $scope.$on(eventName, function(event, data) {
                    $scope.wip = data.wip;
                });
                $scope.wipState = $scope.states.filter(function(s) {
                    return s.name === wipStateName;
                })[0];
            }
        }

        function link(scope, element, attrs) {
            scope.$watch(wipIsCurrent, function(value) {
                value ? element.addClass('current') : element.removeClass('current');
            });

            function wipIsCurrent() {
                if (!$state.current || !$state.current.title) {
                    return false;
                }
                return $state.current.name === wipStateName;
            }
        }

        function getTemplate() {
            return '<a ui-sref="{{wipState.name}}" >'
                + '<i class="icon-asterisk" data-ng-class="getWipClass()"></i>'
                + 'Work in Progress ({{wip.length}})</a>';
        }
    }]);

    app.directive('scWipPeek', function ($compile) {
        //Usage:
        //<div data-sc-wip-peek="entity"></div>
        var directive = {
            controller: ['$scope', 'datacontext', scWipPeekController],
            restrict: 'A',
            //scope: true,
            link: function(scope, element, attrs) {
                var item = scope.$eval(attrs.scWipPeek);
                var val = scope.getDetails(item);

                //ToDo: either use vanilla html or js or check if angular.ui.bootstrap exists
                //before applying this attribute to the element
                if (val && !element.attr('tooltip-html-unsafe')) {
                    element.attr('tooltip-html-unsafe', val);
                    $compile(element[0])(scope);
                }
            }
        };

        return directive;

        function scWipPeekController($scope, datacontext) {
            $scope.getDetails = getDetails;

            function getDetails(wipItem) {
                var state = wipItem.state || wipItem.entityAspect.entityState;
                if (state == breeze.EntityState.Modified) {
                    return getOriginalValues(wipItem);
                }
                return '';

                function getOriginalValues(_wipItem) {
                    //If already an entity, don't bother going to repo
                    if (_wipItem.entityAspect) {
                        return getOriginalValuesCore(_wipItem);
                    }

                    //else get entity first
                    var entity = getEntity(_wipItem);
                    return getOriginalValuesCore(entity);

                    function getEntity(_wipItem) {
                        var repoName = _wipItem.entityName.toLowerCase();
                        var result = datacontext[repoName].getEntityByIdLocal(_wipItem.id);

                        //getEntityByIdOrFromWip may return imported entity from wipStorage
                        //thus, the result.entity call
                        var entity = result.entity || result;
                        return entity;
                    }

                    function getOriginalValuesCore(entity) {
                        var details = '';
                        var props = Object.keys(entity.entityAspect.originalValues);
                        props.forEach(function (prop) {
                            if (!isPropForeignKey(entity.entityType, prop)) {
                                var text = getDetailsFromProp(entity, prop);
                                details = details + text + '</br>';
                            } else {
                                var text = getDetailsFromNavProp(entity, prop);
                                details = details + text + '</br>';
                            }
                        });
                        return details;
                    }

                    function getDetailsFromProp(entity, propName) {
                        var oldValue = entity.entityAspect.originalValues[propName];
                        var newValue = entity.getProperty(propName);
                        var displayName = getPropDisplayName(entity.entityType, propName);
                        var text = String.format('{0} changed from <b><font color=red>{1}</font></b> to <b><font color=green>{2}</font></b>', displayName, oldValue, newValue);
                        return text;
                    }

                    function getDetailsFromNavProp(entity, propName) {
                        //get the DataProperty
                        var dp = entity.entityType.getDataProperty(propName);
                        //get the repository name from the relatedNavigationProperty entityType
                        var repoName = dp.relatedNavigationProperty.entityType.shortName.toLowerCase();
                        //get old and new fk id
                        var oldId = entity.entityAspect.originalValues[propName];
                        var newId = entity.getProperty(propName);
                        //get old and new related entity
                        var oldEntity = datacontext[repoName].getEntityByIdLocal(oldId);
                        var newEntity = datacontext[repoName].getEntityByIdLocal(newId);
                        //get the property descriptor from the DataProperty custom object
                        var description = dp.custom.navPropDesc;
                        //get the descriptor's old and new value from the related entity
                        var oldValue = oldEntity.getProperty(description);
                        var newValue = newEntity.getProperty(description);

                        //now compose the tooltip text
                        var displayName = getPropDisplayName(dp.relatedNavigationProperty.entityType, description);
                        var text = String.format('{0} changed from <b><font color=red>{1}</font></b> to <b><font color=green>{2}</font></b>', displayName, oldValue, newValue);
                        return text;
                    }

                    function isPropForeignKey(entityType, propName) {
                        return entityType.getDataProperty(propName).relatedNavigationProperty;
                    }

                    function getPropDisplayName(entityType, propName) {
                        var dp = entityType.getDataProperty(propName);
                        return dp.displayName || upperCaseFirstLetter(propName);

                        function upperCaseFirstLetter(str) {
                            return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
                        }
                    }
                }
            }

            
        }
    });

})();