export function navigate(path: string) {
	const a = document.createElement("a");
	a.href = path;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
