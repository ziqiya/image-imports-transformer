import * as vscode from 'vscode';

function toCamelCase(str: string): string {
  return str
    .split('-')
    .map((word, index) => {
      if (index === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
}

export function activate(context: vscode.ExtensionContext) {
  console.log('插件已激活: image-imports-transformer');

  let disposable = vscode.commands.registerCommand(
    'image-imports-transformer.transform',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const text = document.getText();

      const objName =
        (await vscode.window.showInputBox({
          placeHolder: 'IMG_OBJ',
          prompt: '请输入要使用的图片对象名称'
        })) || 'IMG_OBJ';

      const importMap = new Map();
      let needImport = false;

      // 匹配 import 语句
      const importRegex =
        /import\s+(\w+)\s+from\s+['"]([^'"]+\.(?:png|jpg|jpeg|gif|svg))['"];?\n?/g;
      const requireRegex =
        /(?<!styles\.)\b(require\(['"]([^'"]+\.(?:png|jpg|jpeg|gif|svg))['"]\))/g;

      // 处理 import 语句
      let match;
      while ((match = importRegex.exec(text)) !== null) {
        const [_, importName, fileName] = match;
        const baseFileName = fileName.split('/').pop()?.split('.')[0];
        if (baseFileName) {
          importMap.set(importName, toCamelCase(baseFileName));
          needImport = true;
        }
      }

      // 检查是否有 require 语句需要替换
      const hasRequireMatch = requireRegex.test(text);
      if (hasRequireMatch) {
        needImport = true;
      }

      // 如果没有需要替换的内容，直接返回
      if (!needImport) {
        vscode.window.showInformationMessage('没有找到需要转换的图片导入语句!');
        return;
      }

      // 检查是否已经导入了指定的对象
      const hasImport = new RegExp(
        `import[^;]*{[^}]*${objName}[^}]*}[^;]*from\\s+['"]@/constant['"];?`
      ).test(text);

      // 移除所有图片导入语句
      let newContent = text.replace(importRegex, '');

      // 替换 require 语句
      newContent = newContent.replace(
        requireRegex,
        (match, fullRequire, fileName) => {
          const baseFileName = fileName.split('/').pop()?.split('.')[0];
          return `${objName}.${toCamelCase(baseFileName)}`;
        }
      );

      // 替换使用到的变量名 (排除 styles. 前缀)
      importMap.forEach((fileName, importName) => {
        const useRegex = new RegExp(`(?<!styles\\.)\\b${importName}\\b`, 'g');
        newContent = newContent.replace(useRegex, `${objName}.${fileName}`);
      });

      // 如果需要添加导入语句
      if (needImport && !hasImport) {
        const lastImportIndex = (() => {
          const importLines = newContent.split('\n');
          let lastIndex = -1;
          for (let i = 0; i < importLines.length; i++) {
            if (importLines[i].trim().startsWith('import ')) {
              lastIndex = i;
            }
          }
          return lastIndex;
        })();

        if (lastImportIndex !== -1) {
          const lines = newContent.split('\n');
          lines.splice(
            lastImportIndex + 1,
            0,
            `import { ${objName} } from '@/constant';`
          );
          newContent = lines.join('\n');
        }
      }

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );

      editor.edit(editBuilder => {
        editBuilder.replace(fullRange, newContent);
      });

      vscode.window.showInformationMessage('图片导入语句处理完成!');
    }
  );

  context.subscriptions.push(disposable);
}
