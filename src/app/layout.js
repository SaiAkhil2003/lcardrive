import "./globals.css";	
export const metadata = {
	title: "LCarDrive",
	description: "Find trusted divisions across Australia."
};
export default function RootLayout({children}){
	return(
		<html lang="en">
			<body>{children}</body>
		</html>	
	);
}
