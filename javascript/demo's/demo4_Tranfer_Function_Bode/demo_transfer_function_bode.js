
function setup()
{
	confirm("Hello");
	var Slider1 = document.getElementById('slider_1');

		noUiSlider.create(Slider1, 
		{
			start: [ 1.5 ],
			step: 0.01,
			range: 
			{
				'min': [  0.01 ],
				'max': [ 3 ]
			}
		});
}

window.onload = setup;
	