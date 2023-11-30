import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, './src/index.ts'),
			name: 'features',
			// 构建好的文件名（不包括文件后缀）
			fileName: 'features'
		},
		rollupOptions: {
			// 确保外部化处理那些你不想打包进库的依赖
			external: ['lodash', 'reflect-metadata'],
			output: {
				// 在 UMD 构建模式下,全局模式下为这些外部化的依赖提供一个全局变量
				globals: {
					lodash: 'lodash'
				}
			}
		}
	},
	plugins: [dts()]
});
