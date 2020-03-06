import * as stackTrace from 'stack-trace'
import { ErrorStack } from '../../@types'
import * as fs from 'fs'

export class StackResolverService {
	private exception: any

	constructor(exception: any) {
		this.exception = exception
	}

	public async getProperErrorStack(): Promise<ErrorStack> {
		let errorStack = await stackTrace.parse(this.exception)

		await errorStack.map(async (_stack, index) => {
			// Resolve the exception line and add it to stack object as property.
			const data = fs.readFileSync(errorStack[index].fileName, 'utf-8')
			const lines = data.split(/\r?\n/);
			errorStack[index].codeRaw = lines.slice((errorStack[index].lineNumber - 16) >= 0 ? errorStack[index].lineNumber - 16 : 0, errorStack[index].lineNumber + 15)

			// Update absolute paths with relative ones.
			const relativeFileName = errorStack[index].getFileName().indexOf(process.cwd())
			if (relativeFileName > -1) {
				errorStack[index].fileName = errorStack[index].getFileName().replace(process.cwd(), '').replace(/\\|\//, '')
			} else {
				errorStack[index].fileName = errorStack[index].getFileName()
			}
		})

		return errorStack
	}
}
