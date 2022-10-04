import {
  combineLatest,
  forkJoin,
  interval,
  Observable,
  partition,
  race,
  zip,
} from 'rxjs';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { HighlightResult } from 'ngx-highlightjs';
import { concat, take, takeUntil, map, merge, of, timer } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  response: HighlightResult;

  @Input() method: string = 'merge';

  code = ``;
  diagram = ``;
  isReady = false;

  ngOnInit() {
    this.isReady = true;
  }

  onHighlight(e) {
    this.response = {
      language: e.language,
      relevance: e.relevance,
      second_best: '{...}',
      top: '{...}',
      value: '{...}',
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    console.clear();
    this.isReady = false;
    switch (this.method) {
      case 'concat':
        this.setConcatCode();
        this.concat();
        break;
      case 'merge':
        this.setMergeCode();
        this.merge();
        break;
      case 'zip':
        this.setZipCode();
        this.zip();
        break;
      case 'partition':
        this.setPartitionCode();
        this.partition();
        break;
      case 'combineLatest':
        this.setCombineLatestCode();
        this.combineLatest();
        break;
      case 'forkJoin':
        this.setForkJoinCode();
        this.forkJoin();
        break;
      case 'race':
        this.setRaceCode();
        this.race();
        break;
      default:
        this.code = `
        `;
        this.diagram = ``;
    }
    setTimeout(() => {
      this.isReady = true;
    });
  }

  concat() {
    const sourceA$ = of(1, 2);
    const sourceB$ = of(3, 4);
    const sourceC$ = of(5, 6);

    // concat會按照順序執行
    concat(sourceA$, sourceB$, sourceC$).subscribe((data) => {
      console.log(data);
    });
  }

  setConcatCode() {
    this.code = `const sourceA$ = of(1, 2);
const sourceB$ = of(3, 4);
const sourceC$ = of(5, 6);

// concat會按照順序執行
concat(sourceA$, sourceB$, sourceC$)
  .subscribe(data => {
    console.log(data);
});`;
    this.diagram = `
sourceA$: 12|
sourceB$: 34|
sourceC$: 56|

concat(sourceA$, sourceB$, source$)
          123456|`;
  }

  merge() {
    const sourceA$ = interval(1000)
      .pipe(take(15))
      .pipe(map((data) => `A${data + 1}`));

    const sourceB$ = interval(3000)
      .pipe(take(5))
      .pipe(map((data) => `B${data + 1}`));

    const sourceC$ = interval(5000)
      .pipe(take(3))
      .pipe(map((data) => `C${data + 1}`));

    const subscription = merge(sourceA$, sourceB$, sourceC$).subscribe(
      (data) => {
        console.log(`merge 範例： ${data}`);
      }
    );
  }

  setMergeCode() {
    this.code = `const sourceA$ = interval(100).pipe(take(15)).pipe(
  map(data => \`A\${data}\`)
);
const sourceB$ = interval(300).pipe(take(5)).pipe(
  map(data => \`B\${data}\`)
);
const sourceC$ = interval(500).pipe(take(3)).pipe(
  map(data => \`C\${data}\`)
);
const subscription = merge(sourceA$, sourceB$, sourceC$)
  .subscribe(data => {
  console.log(\`merge 範例： \${data}\`)
});`;
    this.diagram = `
sourceA$: --A1--A2--A3--A4--A5--A6--
sourceB$: ----------B1----------B2--
sourceC$: ------------------C1------
    
merge(sourceA$, sourceB$, sourceC$)
          --A1--A2--(A3,B1)--A4--(A5,C1)--(A6,B2)------`;
  }

  zip() {
    const sourceA$ = interval(1000)
      .pipe(take(15))
      .pipe(map((data) => `A${data + 1}`));
    const sourceB$ = interval(2000)
      .pipe(take(5))
      .pipe(map((data) => `B${data + 1}`));
    const sourceC$ = interval(3000)
      .pipe(take(3))
      .pipe(map((data) => `C${data + 1}`));

    zip(sourceA$, sourceB$, sourceC$).subscribe((data) => {
      console.log(`zip 範例: ${data}`);
    });
  }

  setZipCode() {
    this.code = `const sourceA$ = interval(1000).pipe(take(15)).pipe(
  map(data => \`A\${data + 1}\`)
);
const sourceB$ = interval(2000).pipe(take(5)).pipe(
  map(data => \`B\${data + 1}\`)
);
const sourceC$ = interval(3000).pipe(take(3)).pipe(
  map(data => \`C\${data + 1}\`)
);

zip(sourceA$, sourceB$, sourceC$).subscribe(data => {
  console.log(\`zip 範例: \${data}\`)
});`;
    this.diagram = `
sourceA$: --A1--A2--A3--A4--............
sourceB$:   ----B1  ----B2  ----B3--....
sourceC$:     ------C1    ------C2    ------C3......

zip(sourceA$, sourceB$, sourceC$)
              ------**    ------**    ------**.......
                [A1,B1,C1]  [A2,B2,C2]  [A3,B3,C3]`;
  }

  partition() {
    const source$ = of(1, 2, 3, 4, 5, 6);

    const [sourceEven$, sourceOdd$] = partition(
      source$,
      (data) => data % 2 === 0
    );

    sourceEven$.subscribe((data) =>
      console.log(`partition 範例 (偶數): ${data}`)
    );
    sourceOdd$.subscribe((data) =>
      console.log(`partition 範例 (奇數): ${data}`)
    );
  }

  setPartitionCode() {
    this.code = `const source$ = of(1, 2, 3, 4, 5, 6);
const [sourceEven$, sourceOdd$] = partition(
  source$,
  (data) => data % 2 === 0
);
sourceEven$.subscribe((data) =>
  console.log(\`partition 範例 (偶數): \${data}\`)
);
sourceOdd$.subscribe((data) =>
  console.log(\`partition 範例 (奇數): \${data}\`)
);`;
    this.diagram = `
source$:     -----1-----2-----3-----4-----5-----6-----|

[sourceEven$, sourceOdd$] = partition(source$, (data) => data % 2 === 0);
sourceEven$: -----------2-----------4-----------6-----|
sourceOdd$:  -----1-----------3-----------5-----------|`;
  }

  combineLatest() {
    const sourceA$ = interval(1000)
      .pipe(take(6))
      .pipe(map((data) => `A${data + 1}`));
    const sourceB$ = interval(2000)
      .pipe(take(3))
      .pipe(map((data) => `B${data + 1}`));
    const sourceC$ = interval(3000)
      .pipe(take(2))
      .pipe(map((data) => `C${data + 1}`));

    const subscription = combineLatest(
      [sourceA$, sourceB$, sourceC$],
      (a, b, c) => {
        return '[' + a + ',' + b + ',' + c + ']';
      }
    ).subscribe((data) => console.log(`combineLatest 範例: ${data}`));
  }

  setCombineLatestCode() {
    this.code = `const sourceA$ = interval(1000).pipe(
  map(data => \`A\${data + 1}\`)
);
const sourceB$ = interval(2000).pipe(
  map(data => \`B\${data + 1}\`)
);
const sourceC$ = interval(3000).pipe(
  map(data => \`C\${data + 1}\`)
);

const subscription = combineLatest([sourceA$, sourceB$, sourceC$])
  .subscribe(data => console.log(\`combineLatest 範例: \${data}\`));`;
    this.diagram = `
sourceA$: --A1--A2--A3--A4--A5......           
sourceB$:   ----B1  ----B2  --....
sourceC$:     ------C1                          

zip(sourceA$, sourceB$, sourceC$)
              ------**--**        --**.......
            [A3,B1,C1] [A4,B1,C1]  
                       [A4,B2,C1] (兩個來源 Observable 同時發生事件)`;
  }

  forkJoin() {
    const sourceA$ = interval(1000).pipe(
      map((data) => `A${data + 1}`),
      take(5)
    );
    const sourceB$ = interval(2000).pipe(
      map((data) => `B${data + 1}`),
      take(4)
    );
    const sourceC$ = interval(3000).pipe(
      map((data) => `C${data + 1}`),
      take(3)
    );

    forkJoin([sourceA$, sourceB$, sourceC$]).subscribe({
      next: (data) => console.log(`forkJoin 範例: ${data}`),
      complete: () => console.log('forkJoin 結束'),
    });
  }

  setForkJoinCode() {
    this.code = `const sourceA$ = interval(1000).pipe(
  map(data => \`A\${data + 1}\`),
  take(5)
);
const sourceB$ = interval(2000).pipe(
  map(data => \`B\${data + 1}\`),
  take(4)
);
const sourceC$ = interval(3000).pipe(
  map(data => \`C\${data + 1}\`),
  take(3)
);

forkJoin([sourceA$, sourceB$, sourceC$]).subscribe({
  next: data => console.log(\`forkJoin 範例: \${data}\`),
  complete: () => console.log('forkJoin 結束')
});`;
    this.diagram = `
sourceA$: --A1--A2--A3--A4--A5|
sourceB$:   ----B1  ----B2  ----B3|
sourceC$:     ------C1    ------C2    ------C3|

forkJoin(sourceA$, sourceB$, sourceC#)
              ------      ------      ------**|
                                        [A5,B3,C3]`;
  }

  race() {
    const sourceA$ = interval(1000)
      .pipe(take(6))
      .pipe(map((data) => `A${data + 1}`));
    const sourceB$ = interval(2000)
      .pipe(take(3))
      .pipe(map((data) => `B${data + 1}`));
    const sourceC$ = interval(3000)
      .pipe(take(2))
      .pipe(map((data) => `C${data + 1}`));

    const subscription = race([sourceA$, sourceB$, sourceC$]).subscribe(
      (data) => console.log(`race 範例: ${data}`)
    );
  }

  setRaceCode() {
    this.code = `const sourceA$ = interval(1000)
    .pipe(take(6))
    .pipe(map((data) => \`A\${data + 1}\`));
  const sourceB$ = interval(2000)
    .pipe(take(3))
    .pipe(map((data) => \`B\${data + 1}\`));
  const sourceC$ = interval(3000)
    .pipe(take(2))
    .pipe(map((data) => \`C\${data + 1}\`));

  const subscription = race([sourceA$, sourceB$, sourceC$]).subscribe(
    (data) => console.log(\`race 範例: \${data}\`)
  );`;
    this.diagram = `
sourceA$: --A1--A2--A3.....
sourceB$:   ----B1.........
sourceC$:     ------C1.....

race(sourceA$, sourceB$, sourceC$)
          --A1--A2--A3..... 
            ^ sourceA$ 先到了，因此退訂 sourceB$ 和 sourceC$`;
  }
}
