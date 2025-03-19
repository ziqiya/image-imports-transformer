import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Image Imports Transformer Test Suite', () => {
  const testCases = [
    {
      name: '测试基本的 import 转换',
      input: `
import bgImg from '@/assets/bgImg.png';
import testIcon from '@/assets/test-icon.png';

const App = () => {
  return (
    <div>
      <img src={bgImg} />
      <img src={testIcon} />
    </div>
  );
};`,
      expected: `
import { IMG_OBJ } from '@/constant';

const App = () => {
  return (
    <div>
      <img src={IMG_OBJ.bgImg} />
      <img src={IMG_OBJ.testIcon} />
    </div>
  );
};`
    },
    {
      name: '测试 require 语句转换',
      input: `
const bgImage = require('@/assets/bg-image.png');
const styles = {
  background: require('@/assets/background.png')
};`,
      expected: `
import { IMG_OBJ } from '@/constant';

const bgImage = IMG_OBJ.bgImage;
const styles = {
  background: IMG_OBJ.background
};`
    },
    {
      name: '测试已存在 IMG_OBJ 导入时不重复添加',
      input: `
import { IMG_OBJ } from '@/constant';
import bgImg from '@/assets/bgImg.png';

const App = () => {
  return <img src={bgImg} />;
};`,
      expected: `
import { IMG_OBJ } from '@/constant';

const App = () => {
  return <img src={IMG_OBJ.bgImg} />;
};`
    },
    {
      name: '测试不转换 styles 前缀的变量',
      input: `
import bgImg from '@/assets/bgImg.png';

const App = () => {
  return <div className={styles.bgImg}><img src={bgImg} /></div>;
};`,
      expected: `
import { IMG_OBJ } from '@/constant';

const App = () => {
  return <div className={styles.bgImg}><img src={IMG_OBJ.bgImg} /></div>;
};`
    }
  ];

  // 在所有测试开始前设置配置
  suiteSetup(async () => {
    await vscode.workspace
      .getConfiguration('imageImports')
      .update('importPath', '@/constant', true);
    await vscode.workspace
      .getConfiguration('imageImports')
      .update('objectName', 'IMG_OBJ', true);
  });

  testCases.forEach(({ name, input, expected }) => {
    test(name, async () => {
      // 创建临时文件
      const document = await vscode.workspace.openTextDocument({
        content: input,
        language: 'typescript'
      });

      // 打开文件
      const editor = await vscode.window.showTextDocument(document);

      // 执行命令
      await vscode.commands.executeCommand(
        'image-imports-transformer.transform'
      );

      // 等待编辑操作完成
      await new Promise(resolve => setTimeout(resolve, 100));

      // 验证结果
      assert.strictEqual(
        document.getText().replace(/\s+/g, ' ').trim(),
        expected.replace(/\s+/g, ' ').trim(),
        '转换结果与预期不符'
      );
    });
  });

  // 清理配置
  suiteTeardown(async () => {
    await vscode.workspace
      .getConfiguration('imageImports')
      .update('importPath', undefined, true);
    await vscode.workspace
      .getConfiguration('imageImports')
      .update('objectName', undefined, true);
  });
});
