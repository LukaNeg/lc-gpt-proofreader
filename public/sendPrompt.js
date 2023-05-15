
document.getElementById('textForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const inputText = document.getElementById('inputText').value;
  console.log(JSON.stringify({ inputText }));

  // Update the loading container text
  document.getElementById('loadingIndicator').textContent = 'Processing text...';

  const response = await fetch('/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputText })
  });

  const result = await response.json();

  // Update the loading container text back to the initial state
  document.getElementById('loadingIndicator').textContent = '';

  const inputTextLineBr = inputText.replaceAll(/(?:\r\n|\r|\n)/g, '<br>'); //this replaces line breaks with <br> tags

  const input = diff(inputTextLineBr, result.outputText);

  // document.getElementById('outputText').innerText = result.outputText;

  // Show HTML diff output as HTML!
  document.getElementById("inputDiff").innerHTML = input;
  document.getElementById("outputClean").innerHTML = result.outputText.replaceAll(/(?:\r\n|\r|\n)/g, '<br>'); //this replaces line breaks with <br> tags
  document.getElementById("outputAdvice").innerHTML = result.adviceText;

  // console.log("test input text");
  // console.log(inputText.replaceAll(/(?:\r\n|\r|\n)/g, '<br>'));
  // console.log(inputText);

});

// download button:
document.getElementById('downloadBtn').addEventListener('click', function() {
  var text = document.getElementById('outputClean').innerText;
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', 'correctedText.txt');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
});

// limit input length:
document.getElementById('inputText').addEventListener('input', function() {
  var words = this.value.match(/\S+/g).length;
  if (words > 1400) {
    // Split the string on first 2500 words and rejoin on spaces
    var trimmed = this.value.split(/\s+/, 1400).join(' ');
    // Add a space at the end to keep new typing making new words
    this.value = trimmed + ' ';
  }
});
