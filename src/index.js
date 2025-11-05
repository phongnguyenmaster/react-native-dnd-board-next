import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  PanGestureHandler,
  GestureHandlerRootView, GestureDetector, Gesture, ScrollView
} from 'react-native-gesture-handler';

import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import style from './style';
import Column from './components/column';
import Repository from './handlers/repository';
import Utils from './commons/utils';

const SCROLL_THRESHOLD = 50;
const SCROLL_STEP = 100;

const DraggableBoard = ({
  repository,
  renderColumnWrapper,
  renderRow,
  columnWidth,
  accessoryRight,
  activeRowStyle,
  activeRowRotation = 8,
  xScrollThreshold = SCROLL_THRESHOLD,
  yScrollThreshold = SCROLL_THRESHOLD,
  dragSpeedFactor = 1,
  onRowPress = () => { },
  onDragStart = () => { },
  onDragEnd = () => { },
  style: boardStyle,
  horizontal = true,
}) => {
  const [forceUpdate, setForceUpdate] = useState(false);
  const [hoverComponent, setHoverComponent] = useState(null);
  const [movingMode, setMovingMode] = useState(false);

  let translateX = useSharedValue(0);
  let translateY = useSharedValue(0);

  let absoluteX = useSharedValue(0);
  let absoluteY = useSharedValue(0);

  const offset = useSharedValue(0);

  const scrollViewRef = useRef();
  const scrollOffset = useRef(0);
  const hoverRowItem = useRef(null);

  useEffect(() => {
    repository.setReload(() => setForceUpdate((prevState) => !prevState));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowPosition = ([x, y]) => {
    if (hoverRowItem.current && (x || y)) {
      const columnAtPosition = repository.moveRow(
        hoverRowItem.current,
        x,
        y,
        listenRowChangeColumn,
      );

      if (columnAtPosition && scrollViewRef.current) {
        // handle scroll horizontal
        if (x + xScrollThreshold > Utils.deviceWidth) {
          scrollOffset.current += SCROLL_STEP;
          scrollViewRef.current.scrollTo({
            x: scrollOffset.current * dragSpeedFactor,
            y: 0,
            animated: true
          });
          repository.measureColumnsLayout();
        } else if (x < xScrollThreshold) {
          scrollOffset.current -= SCROLL_STEP;
          scrollViewRef.current.scrollTo({
            x: scrollOffset.current * dragSpeedFactor,
            y: 0,
            animated: true
          });
          repository.measureColumnsLayout();
        }

        // handle scroll inside item
        // if (y + SCROLL_THRESHOLD > columnAtPosition.layout.y) {
        //   repository.columns[columnAtPosition.id].scrollOffset(y + SCROLL_STEP);
        // } else if (y < SCROLL_THRESHOLD) {
        //   repository.columns[columnAtPosition.id].scrollOffset(y - SCROLL_STEP);
        // }
      }
    }
  };

  const handleColumnPosition = ([x, y]) => {
    // Add column position handling logic if any
  };

  const pan = Gesture.Pan()
    
    .onStart((event) => {
      //  context.startX = translateX.value;
      // context.startY = translateY.value;
    })
    .onUpdate((event, context) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      absoluteX.value = event.absoluteX;
      absoluteY.value = event.absoluteY;
      runOnJS(handleRowPosition)([
        absoluteX.value,
        absoluteY.value
      ]);
      runOnJS(handleColumnPosition)([
        translateX.value,
        translateY.value
      ]);
    })
    .onEnd(() => {
      if (movingMode) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        absoluteX.value = withSpring(0);
        absoluteY.value = withSpring(0);

        runOnJS(setHoverComponent)(null);
        runOnJS(setMovingMode)(false);

        if (onDragEnd) {
          const currentHoverItem = { ...hoverRowItem.current }; // create new object
          runOnJS(onDragEnd)(
            currentHoverItem.oldColumnId,
            currentHoverItem.columnId,
            currentHoverItem
          );
          repository.updateOriginalData();
        }

        repository.showRow(hoverRowItem.current);
        hoverRowItem.current = null;
      }
    }).runOnJS(true);

  const listenRowChangeColumn = (fromColumnId, toColumnId) => {
    runOnJS(updateHoverRowItem)(fromColumnId, toColumnId);
  };

  const updateHoverRowItem = (fromColumnId, toColumnId) => {
    hoverRowItem.current = {
      ...hoverRowItem.current,
      columnId: toColumnId,
      oldColumnId: fromColumnId,
    };
  };

  const onScroll = (event) => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
  };

  const onScrollEnd = (event) => {
    scrollOffset.current = event.nativeEvent.contentOffset.x;
    repository.measureColumnsLayout();
  };

  const keyExtractor = useCallback(
    (item, index) => `${item.id}${item.name}${index}`,
    [],
  );

  const animatedHoverStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${activeRowRotation}deg` }
      ]
    };
  });

  const renderHoverComponent = () => {
    if (hoverComponent && hoverRowItem.current) {
      const row = repository.findRow(hoverRowItem.current);

      if (row && row.layout) {
        const { x, y, width, height } = row.layout;
        const hoverStyle = [
          style.hoverComponent,
          activeRowStyle,
          {
            top: y - yScrollThreshold,
            left: x,
            width,
            height,
          },
          animatedHoverStyle,
        ];

        return (
          <Animated.View style={hoverStyle}>{hoverComponent}</Animated.View>
        );
      }
    }
  };

  const moveItem = async (hoverItem, rowItem, isColumn = false) => {
    if (hoverRowItem.current) {
      repository.showRow(hoverRowItem.current);
    }
    rowItem.setHidden(true);
    repository.hideRow(rowItem);
    await rowItem.measureLayout();
    hoverRowItem.current = { ...rowItem }; // create new object

    setMovingMode(true);
    setHoverComponent(hoverItem);
  };

  const drag = (column) => {
    const hoverColumn = renderColumnWrapper({
      move: moveItem,
      item: column.data,
      index: column.index,
    });
    moveItem(hoverColumn, column, true);
  };

  const renderColumns = () => {
    const columns = repository.getColumns();
    return columns.map((column, index) => {
      const key = keyExtractor(column, index);

      const columnComponent = (
        <Column
          repository={repository}
          column={column}
          move={moveItem}
          renderColumnWrapper={renderColumnWrapper}
          keyExtractor={keyExtractor}
          renderRow={renderRow}
          scrollEnabled={!movingMode}
          columnWidth={columnWidth}
          onRowPress={onRowPress}
          onDragStartCallback={onDragStart}
        />
      );

      return renderColumnWrapper({
        item: column.data,
        index: column.index,
        columnComponent,
        drag: () => drag(column),
        layoutProps: {
          key,
          ref: (ref) => repository.updateColumnRef(column.id, ref),
          onLayout: (layout) => repository.updateColumnLayout(column.id),
        },
      });
    });
  };

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={pan}>
        <Animated.View style={[style.container, boardStyle]}>
          <ScrollView
            ref={scrollViewRef}
            scrollEnabled={!movingMode}
            horizontal={horizontal}
            nestedScrollEnabled
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEnd}
            onMomentumScrollEnd={onScrollEnd}>
            {renderColumns()}
            {Utils.isFunction(accessoryRight) ? accessoryRight() : accessoryRight}
          </ScrollView>
          {renderHoverComponent()}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default DraggableBoard;
export { Repository };
