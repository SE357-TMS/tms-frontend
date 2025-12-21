import React from "react";
import "./UnderDevelopment.css";

const UnderDevelopment = ({ message }) => {
	return (
		<div className="underdev-page">
			<div className="underdev-card">
				<h2>Under Development</h2>
				<p>
					{message ||
						"This page is currently under development. Please check back later."}
				</p>
			</div>
		</div>
	);
};

export default UnderDevelopment;
