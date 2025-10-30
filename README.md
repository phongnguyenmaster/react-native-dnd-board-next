## Important Notice: Project Maintained

Thank for hungga1711, now I am continue maintaining this package

# React Native DnD Board

A drag and drop Kanban board for React Native using [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) and [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/).

<img src="./demo-ios.gif" width="400">   <img src="./demo-android.gif" width="396">

## Installation

### Step 1:

Install [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/).

### Step 2:

Install [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/).

### Step 3:

Install this package using `npm` or `yarn`

with `npm`:

```
npm install react-native-dnd-board-next
```

with `yarn`:

```
yarn add react-native-dnd-board-next
```

## API reference

The package exports a `Board` component which is the one you'd use to render the dnd board and a `Repository` class to handle column, row layout.

### `Board`

| Property            | Type                                                    | Required | Description                                                             |
| :------------------ | :------------------------------------------------------ | :------: | :---------------------------------------------------------------------- |
| repository          | `Repository`                                            |   yes    | Object that holds data                                                  |
| renderRow           | `({ item, index }) => {}`                               |   yes    | Function responsible for rendering row item                             |
| renderColumnWrapper | `({ item, index, columnComponent, layoutProps }) => {}` |   yes    | Function responsible for rendering wrapper of the column                |
| onRowPress          | `(row) => {}`                                           |    no    | Function invoked when row pressed                                       |
| onDragStart         | `() => {}`                                              |    no    | Function invoked when drag is started                                   |
| onDragEnd           | `(fromColumnId, toColumnId, row) => {}`                 |    no    | Function invoked when drag is finished                                  |
| style               | `StyleProp`                                             |    no    | Style of the board                                                      |
| columnWidth         | `number`                                                |    no    | Initial min column width                                                |
| accessoryRight      | `function\|View`                                        |    no    | Render end of the board. Useful when rendering virtual add more column. |
| activeRowStyle      | `StyleProp`                                             |    no    | A custom style for the row when being dragged.                          |
| activeRowRotation   | `number`                                                |    no    | Degrees to rotate the row when being dragged. Default is 8.             |
| xScrollThreshold    | `number`                                                |    no    | Offset from X to calculate scroll from. Default is 50.                  |
| yScrollThreshold    | `number`                                                |    no    | Offset from Y for the rows. Default is 50.                              |
| dragSpeedFactor     | `number`                                                |    no    | When dragging you can accelerate the scrollTo position. Default is 1.   |

### `Repository`

#### Update repository data:
```js
repository.updateData(data);
```
#### Handle column data:
```js
repository.addColumn(data);
```
```js
repository.updateColumn(columnId, data);
```
```js
repository.deleteColumn(columnId);
```
#### Handle row data:
```js
repository.addRow(columnId, data);
```
```js
repository.updateRow(rowId, data);
```
```js
repository.deleteRow(rowId);
```

#### Get rows with index updated:
```js
const { rows } = repository.getItemsChanged();
```
#### Get final result data:
```js
repository.updateOriginalData();
const result = repository.originalData;
```
**[Example](https://github.com/phongnguyenmaster/react-native-dnd-board-next/blob/master/example/app/index.tsx)**
## Usage

You need to build `Repository`

```js
import Board, { Repository } from "react-native-dnd-board";

const mockData = [
  {
    id: "1",
    name: "Column 1",
    rows: [
      {
        id: "11",
        name: "Row 1 (Column 1)",
      },
      {
        id: "12",
        name: "Row 2 (Column 1)",
      },
    ],
  },
  {
    id: "2",
    name: "Column 2",
    rows: [
      {
        id: "21",
        name: "Row 1 (Column 2)",
      },
    ],
  },
];

const [repository, setRepository] = useState(new Repository(mockData));
```

Render the `Board`

```js
<Board
  repository={repository}
  renderRow={renderCard}
  renderColumnWrapper={renderColumnWrapper}
  onRowPress={onCardPress}
  onDragEnd={onDragEnd}
/>
```

`renderColumnWrapper` function

```js
const renderColumnWrapper = ({ item, columnComponent, layoutProps }) => {
  return (
    <View style={styles.column} key={layoutProps.key} ref={layoutProps.ref} onLayout={layoutProps.onLayout}>
      <Text style={styles.columnName}>{item.name}</Text>
      {columnComponent}
    </View>
  );
};
```

**IMPORTANT:** You need pass `layoutProps` to wrapper view props and `columnComponent` must be rendered inside `renderColumnWrapper` fuction.

See [example](https://github.com/phongnguyenmaster/react-native-dnd-board-next/blob/master/example/app/index.tsx) for more details.

## Performance

We're trying to improve board performance. If you have a better solution, please open a [issue](https://github.com/phongnguyenmaster/react-native-dnd-board-next/issues)
or [pull request](https://github.com/phongnguyenmaster/react-native-dnd-board-next/pulls). Best regards!
