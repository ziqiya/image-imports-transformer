# image-imports-transformer README

图片import转换器，用于微信taro小程序的图片线上化，用本地的IMG_OBJ地址代替本地文件的import。

## 使用方法

在tsx,jsx文件右键菜单中选择"image-import-transform"或者使用cmd+shift+p在命令菜单中找到"image-import-transform"命令并使用。

## Features

用于图片import转换器，用于微信taro小程序的图片线上化，用本地的IMG_OBJ地址代替本地文件的import。IMG_OBJ结构如下：

```
// 当前项目 OSS 容器桶图片前缀地址
const IMG_URL = 'https://xxxx/';

export const IMG_OBJ = Object.freeze({
  wechat: `${IMG_URL}wechat.png`,
  bgImg: `${IMG_URL}bgImg.png`,
})
```

使用后可以转换项目文件下以下结构：

### 1.把文件中import的图片转换为IMG_OBJ(变量名可自定义)导入的格式(根据图片名称),遇到-自动转小驼峰。
```
const fileContent = `
import img1 from '@/assets/img1.png';
import img2 from '@/assets/tupian.svg';
import img3 from '@/assets/title-img.png';

const backgroundImage = {
  [orderTypeEnum.图片1]: img1,
  [orderTypeEnum.图片2]: img2,
  [orderTypeEnum.图片3]: img3,
};
`;
```
转换后：
```
const backgroundImage = {
   [orderTypeEnum.图片1]: IMG_OBJ.img1,
  [orderTypeEnum.图片2]: IMG_OBJ.tupian,
  [orderTypeEnum.图片2]: IMG_OBJ.titleImg,
};
```
### 2.把文件中 require 引入图片的语句转为IMG_OBJ.xxx格式
```
// 转换前
require('@/assets/bg-image-large.jpg');

// 转换后
IMG_OBJ.bgImageLarge
```
### 3.如果未引入IMG_OBJ变量自动在import最后引入IMG_OBJ
目录地址可以在extension文件中自行修改
```
import { IMG_OBJ } from '@/constant';
```

