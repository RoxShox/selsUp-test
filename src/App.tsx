import { FormEventHandler, useRef, useState } from "react"

const DataModel: Model = {
	paramValues: [
		{
			paramId: 1,
			value: "повседневное",
		},
		{
			paramId: 2,
			value: "макси",
		},
	],
}

const DataParams: Param[] = [
	{
		id: 1,
		name: "Назначение",
		type: "string",
	},
	{
		id: 2,
		name: "Длина",
		type: "string",
	},
]
function App() {
	const { addParam, deleteParam, params, editParam } = useParamHooks(
		DataModel,
		DataParams
	)
	return (
		<div className="App">
			<div className="app-wrap">
				<AddParamForm addParam={addParam} />
				<ParamList
					items={params}
					editParam={editParam}
					deleteParam={deleteParam}
				/>
			</div>
		</div>
	)
}

export default App

interface IInputValues {
	type: ParamType
	name: string
	value: string
}

const AddParamForm = ({ addParam }: AddParamFormProps) => {
	const [inputValues, setInputValues] = useState<IInputValues>({
		type: "string",
		name: "",
		value: "",
	})
	const types: ParamTypes = ["string", "number", "select"]
	const submitBtnRef = useRef<HTMLButtonElement>(null)
	const handleChangeInputValue = (e: string | ParamType, name: string) => {
		if (inputValues.type === "select" || "number") {
			setInputValues({
				...inputValues,
				value: "",
				[name]: e,
			})
		} else {
			setInputValues({ ...inputValues, [name]: e })
		}
	}

	const handleSubmit: FormEventHandler<HTMLFormElement> = (
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault()

		const newModel = {
			id: +Math.random().toString().slice(2),
			name: inputValues.name,
			type: inputValues.type,
			value: inputValues.value,
		}
		addParam(newModel)

		setInputValues({ type: "string", name: "", value: "" })
	}

	const formValuesIsValid = () => {
		return Boolean(
			!inputValues.name.trim() ||
				!inputValues.value.trim() ||
				inputValues.type === "select"
		)
	}

	return (
		<form onSubmit={handleSubmit} className="form">
			<label>
				<span> Type:</span>
				<br />
				<select
					value={inputValues.type}
					onChange={(e) =>
						handleChangeInputValue(e.target.value as ParamType, "type")
					}
				>
					{types.map((type, i) => (
						<option key={i} value={type}>
							{type[0].toUpperCase() + type.slice(1)}
						</option>
					))}
				</select>
			</label>

			<TextField
				name="name"
				value={inputValues.name}
				onChange={handleChangeInputValue}
				type="string"
			/>

			{inputValues.type === "select" ? (
				<TextField
					name="value"
					value={"Должна быть только строка"}
					onChange={handleChangeInputValue}
					type="string"
					readOnly={true}
				/>
			) : (
				<TextField
					name="value"
					value={inputValues.value}
					onChange={handleChangeInputValue}
					type={inputValues.type}
				/>
			)}

			<button ref={submitBtnRef} type="submit" disabled={formValuesIsValid()}>
				Отправить
			</button>
		</form>
	)
}

function ParamList({ items, editParam, deleteParam }: ParamListProps) {
	const getModels = () => {
		console.log(items)
	}

	return (
		<div>
			<div>
				{items.map((item) => (
					<div key={item.id} className="param-item">
						<label>
							<span>{item.name}</span>
							<br />
							<input
								name={item.name}
								type={item.type}
								value={item.value}
								onChange={(e) => editParam(item.id, e.target.value)}
							/>
						</label>

						<button onClick={() => deleteParam(item.id)}>x</button>
					</div>
				))}
			</div>
			<button onClick={getModels}>Просмотреть в консоли</button>
		</div>
	)
}

const TextField = ({
	name,
	value,
	onChange,
	type,
	readOnly,
}: TextFieldProps) => {
	return (
		<label>
			<span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
			<br />
			<input
				readOnly={readOnly}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value, name.toLowerCase())}
			/>
		</label>
	)
}

export const useParamHooks = (model: Model, dataParams: Param[]) => {
	// совмещаем value хранящиеся в Model с её параметрами хранящимися в Params
	// и получаем данные в нужном виде в котором будем отрисовывать на странице

	const [params, setParams] = useState(() => {
		const values = model.paramValues
		let params: EditorParam[] = []

		dataParams.forEach((param) => {
			const paramValue = values.find((v) => v.paramId === param.id)

			if (paramValue) {
				const newParams = {
					id: param.id,
					name: param.name,
					type: param.type,
					value: paramValue.value,
				}
				params = [...params, newParams]
			}
		})

		return params
	})

	const addParam = (param: EditorParam) => {
		setParams([...params, param])
	}

	const deleteParam = (paramId: EditorParam["id"]) => {
		setParams(params.filter((param) => param.id !== paramId))
	}

	const editParam = (
		paramId: EditorParam["id"],
		value: EditorParam["value"]
	) => {
		setParams(
			params.map((param) =>
				param.id === paramId ? { ...param, value } : param
			)
		)
	}

	return {
		params,
		addParam,
		deleteParam,
		editParam,
	}
}

export type ParamTypes = ["string", "number", "select"]
export type ParamType = ParamTypes[number]

export interface Param {
	id: number
	name: string
	type: ParamTypes[number]
}

export interface Model {
	paramValues: ParamValue[]
	// colors: Color[];
}

export interface ParamValue {
	paramId: number
	value: string
}

interface TextFieldProps {
	name: string
	value: string
	onChange(e: string, name: string): void
	type: ParamType
	readOnly?: boolean
}

interface EditorParam extends Param {
	value: ParamValue["value"]
}

interface ParamListProps {
	items: EditorParam[]
	editParam: (id: number, val: string) => void
	deleteParam: (id: number) => void
}
interface AddParamFormProps {
	addParam: (param: EditorParam) => void
}
