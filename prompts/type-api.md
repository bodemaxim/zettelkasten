# Задание на рефакторинг
У каждого vue-компонента должно быть полностью типизированное Api.

Типизация выносится в файл "*.types". Например, для компонента view-options.vue это будет файл view-options.types.ts.

В этом файле надо убедиться, что есть регион "API компонента". Если его нет - его надо создать. Если он называется немного по-другому (например, 'Api') - переименовать.

Регион 'API компонента' должен быть в самом верху *.types.ts файла сразу после импортов!

Внутри этого региона находится описание API данного vue-компонента.

## Пример
```
//#region API компонента
export type DatetimeFromModel = Date | null;
export type DatetimeToModel = Date | null;
export type AutoRefreshDevicesModel = boolean;

export type ViewOptionsProps = {
  mode?: 'default' | 'binding';
};

export type ViewOptionsEmits = {
  (e: 'apply'): void;
  (e: 'update:auto-refresh-devices', value: boolean): void;
};
//#endregion API компонента
```

Порядок описания:
1. Модели
2. Пропс
3. Эмиты

## Нейминг
### Модели
Если модель НЕ именованная:
```
// компонент EditCameraPanel
const cameraData = defineModel<EditRowPanelDataModel>();
```

В этом случае называем тип <имя-компонента>Model. Например, EditCameraPanelModel

Если модель именнованная:
```
// компонент EditCameraPanel
const cameraData = defineModel<EditRowPanelDataModel>('data');
```

В этом случае называем тип <имя-модели>Model. Например, DataModel

### Пропс
Называем тип <имя-компонента>Props.

### Эмиты
Называем тип <имя-компонента>Emits.

## Переиспользование типов моделей
Если в родительском компоненте тип модели дочернего компонента уже объявлен, то в дочернем компоненте создаем новый тип, которому присваиваем тип из родительского компонента.

```
// В файле *.types.ts в родителе:
/**
 * Если null - панель закрыта
 * Если 'new' - панель открыта для создания новой камеры
 * Если Camera - панель открыта для редактирования существующей камеры
 */
export type EditRowPanelData = Camera | 'new' | null;

// В файле *.types.ts в дочернем компоненте
/**
 * Если null - панель закрыта
 * Если 'new' - панель открыта для создания новой камеры
 * Если Camera - панель открыта для редактирования существующей камеры
 */
export type EditCameraPanelModel = Camera | 'new' | null;
```

## Комментирование моделей
Если модель сложная, как в примере выше, дублируем комментарий к типу в дочерний компонент.